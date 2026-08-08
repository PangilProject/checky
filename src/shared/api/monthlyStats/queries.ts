import {
  documentId,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { monthlyStatsCollectionRef, monthlyStatsDocRef } from "./refs";
import { MONTHLY_STATS_SPLIT_VERSION } from "./types";
import type { MonthlyActivitySummary, MonthlyStats } from "./types";

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

/**
 * 집계 문서가 이미 만들어져 있는 달의 목록을 읽는다.
 *
 * 달력은 집계 문서가 **없을 때만** 원본으로 다시 센다. 그래서 문서가 없는 달은 늘 맞고,
 * 틀어질 수 있는 것은 이미 만들어진 문서뿐이다.
 * 어떤 달을 다시 세어야 하는지 고를 때, 몇 달치인지 추측하는 대신 이 목록을 쓴다.
 *
 * 문서 ID 가 곧 `YYYY-MM` 이라 내용은 보지 않지만, Firestore 는 문서 단위로 과금하므로
 * 관심 구간이 정해져 있으면 range 를 넘겨 그 구간의 문서만 읽는다.
 */
export const getMonthlyStatsMonthsOnce = async (
  userId: string,
  range?: { fromMonth: string; toMonth: string }
): Promise<string[]> => {
  const perf = baselineFetch("monthlyStats/fetch/months", { userId, ...range });
  const collectionRef = monthlyStatsCollectionRef(userId);
  const snap = await getDocs(
    range
      ? query(
          collectionRef,
          where(documentId(), ">=", range.fromMonth),
          where(documentId(), "<=", range.toMonth)
        )
      : collectionRef
  );
  const months = snap.docs
    .map((docSnap) => docSnap.id)
    .filter((id) => MONTH_KEY_PATTERN.test(id));
  perf.end({ count: months.length });
  return months;
};

/**
 * 한 달치 집계 문서를 읽는다.
 *
 * 문서가 없으면 null 이다. 아직 활동이 없는 달이면 정상적인 상태이므로 예외로 다루지 않는다.
 */
export const getMonthlyStatsByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<MonthlyStats | null> => {
  const perf = baselineFetch("monthlyStats/fetch/byMonth", { userId, month });
  const snap = await getDoc(monthlyStatsDocRef(userId, month));

  if (!snap.exists()) {
    perf.end({ count: 0, exists: false });
    return null;
  }

  const data = snap.data() as MonthlyStats;
  perf.end({ count: Object.keys(data.days ?? {}).length, exists: true });
  return data;
};

/**
 * 넘긴 날짜만 덮어쓰고 나머지 날짜는 그대로 둔다.
 *
 * days 를 병합하므로 일부 날짜만 고칠 때 쓴다.
 * 사라진 날짜를 지우지는 못한다. 그 경우에는 replace 를 써야 한다.
 */
export const upsertMonthlyStatsByMonth = async ({
  userId,
  month,
  days,
}: {
  userId: string;
  month: string;
  days: Record<string, MonthlyActivitySummary>;
}) => {
  await setDoc(
    monthlyStatsDocRef(userId, month),
    {
      month,
      days,
      version: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/**
 * 한 달치를 통째로 바꾼다.
 *
 * 병합하지 않으므로 넘기지 않은 날짜는 사라진다.
 * 원본에서 다시 계산한 결과를 덮어쓸 때만 쓴다. 부분 수정에 쓰면 다른 날짜를 잃는다.
 */
export const replaceMonthlyStatsByMonth = async ({
  userId,
  month,
  days,
  version = 1,
}: {
  userId: string;
  month: string;
  days: Record<string, MonthlyActivitySummary>;
  version?: number;
}) => {
  await setDoc(monthlyStatsDocRef(userId, month), {
    month,
    days,
    version,
    updatedAt: serverTimestamp(),
  });
};

/**
 * 하루의 완료 수만 고친다.
 *
 * 읽고 더한 뒤 쓰는 동작을 트랜잭션으로 묶는다. 묶지 않으면 같은 날짜에 대한 요청이 겹칠 때
 * 뒤에 온 것이 앞선 것의 결과를 읽기 전에 계산해 버려, 한쪽 증감이 통째로 사라진다.
 * 체크를 빠르게 여러 번 누르거나 탭을 두 개 열어 둔 경우에 실제로 일어난다.
 *
 * 완료 수는 전체 수를 넘지 못하게 자른다. 넘어가면 남은 수가 0으로 눌려
 * 달력이 "다 했음"으로 보이게 된다.
 *
 * 집계 문서나 해당 날짜 칸이 아직 없으면 아무것도 하지 않는다.
 * 셀 대상이 정해지지 않은 상태라 완료만 먼저 세면 전체보다 커진다.
 */
export const patchMonthlyStatsCompletionByDay = async ({
  userId,
  month,
  day,
  completedDelta,
  kind,
}: {
  userId: string;
  month: string;
  day: string;
  completedDelta: 1 | -1;
  /** 어느 몫의 완료가 바뀌었는지. 몫이 나뉜 문서(version 2)에서 해당 몫도 함께 고친다. */
  kind: "task" | "routine";
}) => {
  const ref = monthlyStatsDocRef(userId, month);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;

    const data = snap.data() as MonthlyStats;
    const current = data.days?.[day];
    if (!current) return;

    const isSplit = (data.version ?? 1) >= MONTHLY_STATS_SPLIT_VERSION;

    if (isSplit) {
      // 몫이 나뉜 문서는 해당 몫만 증감하고 합산값은 몫의 합으로 다시 만든다.
      // 몫과 합산을 따로 증감하면 둘이 어긋난 채 굳을 수 있다.
      const kindTotal = Math.max(current[`${kind}Total`] ?? 0, 0);
      const kindCompleted = Math.min(
        Math.max((current[`${kind}Completed`] ?? 0) + completedDelta, 0),
        kindTotal
      );
      const taskCompleted =
        kind === "task" ? kindCompleted : Math.max(current.taskCompleted ?? 0, 0);
      const routineCompleted =
        kind === "routine"
          ? kindCompleted
          : Math.max(current.routineCompleted ?? 0, 0);

      const total = Math.max(current.total ?? 0, 0);
      const completed = Math.min(taskCompleted + routineCompleted, total);

      transaction.set(
        ref,
        {
          days: {
            [day]: {
              ...current,
              completed,
              remaining: Math.max(total - completed, 0),
              hasActivity: total > 0,
              taskCompleted,
              routineCompleted,
            },
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return;
    }

    const total = Math.max(current.total ?? 0, 0);
    const completed = Math.min(
      Math.max((current.completed ?? 0) + completedDelta, 0),
      total
    );
    const remaining = Math.max(total - completed, 0);

    transaction.set(
      ref,
      {
        days: {
          [day]: {
            ...current,
            completed,
            remaining,
            hasActivity: total > 0,
          },
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
};

/**
 * 하루의 집계를 증감값만큼 조정한다. 할 일 경로 전용이다.
 *
 * 할 일을 더하거나 지웠을 때 전체를 다시 세지 않고 차이만 반영한다.
 * 몫이 나뉜 문서(version 2)에서는 task 몫을 증감하고 합산값은 몫의 합으로 다시 만들어,
 * 문서 세대를 유지한다. 옛 문서는 합산값만 고치고 세대도 그대로 둔다.
 *
 * 읽고 더한 뒤 쓰는 동작을 트랜잭션으로 묶는다. 묶지 않으면 할 일을 빠르게 연달아 추가할 때
 * 뒤 요청이 앞 요청의 결과를 읽기 전에 계산해, 두 개를 넣었는데 전체가 하나만 늘어난다.
 *
 * 집계 문서가 아직 없으면 아무것도 하지 않는다(완료 패치와 같은 규칙).
 * 여기서 그날 하나짜리 문서를 만들면 달력이 문서가 있다고 보고 원본 계산을 건너뛰어,
 * 그 달의 다른 활동이 통째로 사라져 보인다. 문서 없는 달은 달력이 열릴 때
 * 원본에서 완전하게 계산해 만드는 쪽이 맞다.
 *
 * 음수로 내려가지 않게 0 에서 막고, 완료·잔여가 전체를 넘지 않도록 잘라 낸다.
 * 세 증감이 모두 0 이면 아무것도 하지 않는다.
 */
export const patchMonthlyStatsByDayDeltas = async ({
  userId,
  month,
  day,
  totalDelta,
  completedDelta,
  remainingDelta,
}: {
  userId: string;
  month: string;
  day: string;
  totalDelta: number;
  completedDelta: number;
  remainingDelta: number;
}) => {
  if (!totalDelta && !completedDelta && !remainingDelta) return;

  const ref = monthlyStatsDocRef(userId, month);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;

    const data = snap.data() as MonthlyStats;
    const current = data.days?.[day];
    const version = data.version ?? 1;

    if (version >= MONTHLY_STATS_SPLIT_VERSION) {
      // 몫이 나뉜 문서에 없는 날짜는 그날 활동이 없었다는 뜻이므로,
      // 루틴 몫 0 에 task 증감만 반영한 새 칸을 만들어도 정확하다.
      const taskTotal = Math.max((current?.taskTotal ?? 0) + totalDelta, 0);
      const taskCompleted = Math.min(
        Math.max((current?.taskCompleted ?? 0) + completedDelta, 0),
        taskTotal
      );
      const routineTotal = Math.max(current?.routineTotal ?? 0, 0);
      const routineCompleted = Math.min(
        Math.max(current?.routineCompleted ?? 0, 0),
        routineTotal
      );

      const total = taskTotal + routineTotal;
      const completed = Math.min(taskCompleted + routineCompleted, total);

      transaction.set(
        ref,
        {
          month,
          days: {
            [day]: {
              total,
              completed,
              remaining: Math.max(total - completed, 0),
              hasActivity: total > 0,
              taskTotal,
              taskCompleted,
              routineTotal,
              routineCompleted,
            },
          },
          version,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return;
    }

    const nextTotal = Math.max((current?.total ?? 0) + totalDelta, 0);
    const nextCompleted = Math.max(
      (current?.completed ?? 0) + completedDelta,
      0
    );
    const nextRemaining = Math.max(
      (current?.remaining ?? 0) + remainingDelta,
      0
    );

    transaction.set(
      ref,
      {
        month,
        days: {
          [day]: {
            total: nextTotal,
            completed: Math.min(nextCompleted, nextTotal),
            remaining: Math.min(nextRemaining, nextTotal),
            hasActivity: nextTotal > 0,
          },
        },
        version,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
};

import { getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { monthlyStatsDocRef } from "./refs";
import type { MonthlyActivitySummary, MonthlyStats } from "./types";

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
}: {
  userId: string;
  month: string;
  days: Record<string, MonthlyActivitySummary>;
}) => {
  await setDoc(monthlyStatsDocRef(userId, month), {
    month,
    days,
    version: 1,
    updatedAt: serverTimestamp(),
  });
};

/**
 * 하루의 완료 수만 고친다.
 *
 * 현재 값을 읽어 계산한 뒤 쓰므로 읽기 1회 + 쓰기 1회다.
 * 원자적 증감이 아니라서, 같은 날짜에 대한 요청이 겹치면 나중 것이 앞선 것을 덮을 수 있다.
 */
export const patchMonthlyStatsCompletionByDay = async ({
  userId,
  month,
  day,
  completedDelta,
}: {
  userId: string;
  month: string;
  day: string;
  completedDelta: 1 | -1;
}) => {
  const ref = monthlyStatsDocRef(userId, month);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as MonthlyStats;
  const current = data.days?.[day];
  if (!current) return;

  const completed = Math.max((current.completed ?? 0) + completedDelta, 0);
  const total = Math.max(current.total ?? 0, 0);
  const remaining = Math.max(total - completed, 0);

  await setDoc(
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
};

/**
 * 하루의 집계를 증감값만큼 조정한다.
 *
 * 할 일을 더하거나 지웠을 때 전체를 다시 세지 않고 차이만 반영한다.
 * 현재 값을 읽어 더한 뒤 쓰므로 읽기 1회 + 쓰기 1회이며, 원자적 증감이 아니다.
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
  const snap = await getDoc(ref);
  const data = (snap.exists() ? snap.data() : null) as MonthlyStats | null;
  const current = data?.days?.[day];

  const nextTotal = Math.max((current?.total ?? 0) + totalDelta, 0);
  const nextCompleted = Math.max(
    (current?.completed ?? 0) + completedDelta,
    0
  );
  const nextRemaining = Math.max(
    (current?.remaining ?? 0) + remainingDelta,
    0
  );

  await setDoc(
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
      version: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

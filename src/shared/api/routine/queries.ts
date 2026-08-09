import { getDocs, query, where } from "firebase/firestore/lite";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { mapDoc } from "@/shared/api/_common/mappers";
import { formatDateLikeToYmd } from "@/shared/hooks/formatDate";
import { routineLogsRef, routinesRef } from "./refs";
import type { Routine, RoutineScheduleHistoryItem } from "./types";

export type RoutineMonthly = {
  id: string;
  startDate: string;
  endDate?: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
  /**
   * 마지막 수정일(YYYY-MM-DD). 이력이 없는 레거시 루틴을 셀 때
   * 주간 리포트와 같은 게이트(수정일 이전 날짜 숨김)를 적용하기 위해 든다.
   */
  updatedAt?: string | null;
};
export type RoutineLogMonthly = { routineId: string; date: string; done: boolean };

/**
 * 사용자의 루틴을 모두 읽는다. 루틴 화면이 분류별로 묶어 그릴 때 쓴다.
 *
 * 일부러 정렬 없이 읽는다. 서버 orderBy 는 그 필드가 없는 문서를 결과에서 빼 버려,
 * orderIndex 가 없던 시절의 루틴이 목록에서 사라진다. 정렬은 화면 쪽에서 한다.
 */
export const getRoutinesOnce = async (userId: string): Promise<Routine[]> => {
  const perf = baselineFetch("routines/fetch/all", { userId });
  const snap = await getDocs(routinesRef(userId));
  const routines = snap.docs.map((doc) => mapDoc<Routine>(doc));
  perf.end({ count: routines.length });
  return routines;
};

/**
 * 그달에 걸쳐 있는 루틴을 읽는다.
 *
 * 루틴은 기간으로 이어지므로 그달에 만들어진 것만이 아니라,
 * 이전에 시작해 아직 끝나지 않은 것도 포함한다. 달력을 그릴 때 쓴다.
 */
export const getRoutinesByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<RoutineMonthly[]> => {
  const perf = baselineFetch("routines/fetch/byMonth", { userId, month });
  const start = `${month}-01`;
  const end = `${month}-31`;

  const q = query(routinesRef(userId), where("startDate", "<=", end));
  const snap = await getDocs(q);

  const routines = snap.docs
    .map((doc) => {
    const data = doc.data() as Routine;
    return {
      id: doc.id,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      scheduleHistory: data.scheduleHistory,
      updatedAt: formatDateLikeToYmd(data.updatedAt),
    };
  })
    .filter((routine) => !routine.endDate || routine.endDate >= start);

  perf.end({ count: routines.length });
  return routines;
};

/**
 * 그달의 루틴 수행 기록을 읽는다.
 */
export const getRoutineLogsByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<RoutineLogMonthly[]> => {
  const perf = baselineFetch("routineLogs/fetch/byMonth", { userId, month });
  const start = `${month}-01`;
  const end = `${month}-31`;

  const q = query(
    routineLogsRef(userId),
    where("date", ">=", start),
    where("date", "<=", end),
  );

  const snap = await getDocs(q);
  const logs = snap.docs.map((doc) => doc.data() as RoutineLogMonthly);
  perf.end({ count: logs.length });
  return logs;
};

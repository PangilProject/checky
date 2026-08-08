import { getDocs, query, where } from "firebase/firestore/lite";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { routineLogsRef, routinesRef } from "./refs";
import type { Routine, RoutineScheduleHistoryItem } from "./types";

export type RoutineMonthly = {
  id: string;
  startDate: string;
  endDate?: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
};
export type RoutineLogMonthly = { routineId: string; date: string; done: boolean };

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

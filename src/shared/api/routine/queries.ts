/**
 * @file routine/queries.ts
 * @description API 모듈
 */

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
 * @description 월 기준 루틴을 1회 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
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
 * @description 월 기준 루틴 로그를 1회 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
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

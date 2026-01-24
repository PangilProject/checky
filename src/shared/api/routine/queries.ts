/**
 * @file routine/queries.ts
 * @description API 모듈
 */

import { getDocs, query, where } from "firebase/firestore";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { routineLogsRef, routinesRef } from "./refs";
import type { Routine } from "./types";

export type RoutineMonthly = { startDate: string; days: number[] };
export type RoutineLogMonthly = { date: string; done: boolean };

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
  const end = `${month}-31`;

  const q = query(routinesRef(userId), where("startDate", "<=", end));
  const snap = await getDocs(q);

  const routines = snap.docs.map((doc) => {
    const data = doc.data() as Routine;
    return { startDate: data.startDate, days: data.days };
  });

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

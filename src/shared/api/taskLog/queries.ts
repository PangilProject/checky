/**
 * @file taskLog/queries.ts
 * @description API 모듈
 */

import { getDocs, query, where } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import { taskLogsRef } from "./refs";
import type { TaskLog } from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";

/**
 * @description 날짜 기준 태스크 로그를 1회 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getTaskLogsByDateOnce = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<TaskLog[]> => {
  const perf = baselineFetch("taskLogs/fetch/byDate", { userId, date });
  const q = query(taskLogsRef(userId), where("date", "==", date));
  const snap = await getDocs(q);
  const logs = snap.docs.map((doc) => mapDoc<TaskLog>(doc));
  perf.end({ count: logs.length });
  return logs;
};

/**
 * @description 월 기준 태스크 로그를 1회 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getTaskLogsByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<TaskLog[]> => {
  const perf = baselineFetch("taskLogs/fetch/byMonth", { userId, month });

  const start = `${month}-01`;
  const end = `${month}-31`;
  const q = query(
    taskLogsRef(userId),
    where("date", ">=", start),
    where("date", "<=", end),
  );

  const snap = await getDocs(q);
  const logs = snap.docs.map((doc) => mapDoc<TaskLog>(doc));
  perf.end({ count: logs.length });
  return logs;
};

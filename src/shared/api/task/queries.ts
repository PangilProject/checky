/**
 * @file task/queries.ts
 * @description API 모듈
 */

import { getDocs, query, where } from "firebase/firestore/lite";
import { tasksRef } from "./refs";
import type { Task } from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { mapTaskDoc } from "./mappers";

/**
 * @description 날짜 기준 태스크를 1회 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getTasksByDateOnce = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<Task[]> => {
  const perf = baselineFetch("tasks/fetch/byDate", { userId, date });
  const q = query(tasksRef(userId), where("date", "==", date));
  const snap = await getDocs(q);
  const tasks = snap.docs.map(mapTaskDoc);
  perf.end({ count: tasks.length });
  return tasks;
};

/**
 * @description 월 기준 태스크를 1회 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getTasksByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<Task[]> => {
  const perf = baselineFetch("tasks/fetch/byMonth", { userId, month });

  const start = `${month}-01`;
  const end = `${month}-31`;
  const q = query(
    tasksRef(userId),
    where("date", ">=", start),
    where("date", "<=", end),
  );

  const snap = await getDocs(q);
  const tasks = snap.docs.map(mapTaskDoc);
  perf.end({ count: tasks.length });
  return tasks;
};

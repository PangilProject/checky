/**
 * @file taskSetting/queries.ts
 * @description API 모듈
 */

import { getDocs, query, where } from "firebase/firestore";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Task } from "@/shared/api/task";
import { taskLogsRef, tasksRef } from "./refs";

type TaskLogRecord = {
  taskId: string;
  completed: boolean;
};

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
  const q = query(tasksRef(userId), where("date", "==", date));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => mapDoc<Task>(doc));
};

/**
 * @description 날짜 기준 완료된 태스크 ID를 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getCompletedTaskIdsByDate = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<Set<string>> => {
  const logsSnap = await getDocs(
    query(taskLogsRef(userId), where("date", "==", date))
  );

  const completedTaskIds = new Set(
    logsSnap.docs
      .map((doc) => doc.data() as TaskLogRecord)
      .filter((log) => log.completed)
      .map((log) => log.taskId)
  );

  return completedTaskIds;
};

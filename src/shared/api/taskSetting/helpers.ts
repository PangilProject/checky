/**
 * @file taskSetting/helpers.ts
 * @description API 모듈
 */

import type { Task } from "@/shared/api/task";
import { getCompletedTaskIdsByDate, getTasksByDateOnce } from "./queries";

/**
 * @description 미완료 태스크만 필터링합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getUncompletedTasks = (
  tasks: Task[],
  completedTaskIds: Set<string>
) => tasks.filter((task) => !completedTaskIds.has(task.id));

/**
 * @description 태스크 목록과 완료 ID를 함께 조회합니다.
 * @param params 요청 파라미터
 * @returns 반환값
 */
export const fetchTasksAndCompleted = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}) => {
  const [tasks, completedTaskIds] = await Promise.all([
    getTasksByDateOnce({ userId, date }),
    getCompletedTaskIdsByDate({ userId, date }),
  ]);

  return { tasks, completedTaskIds };
};

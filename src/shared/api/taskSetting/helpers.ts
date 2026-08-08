import type { Task } from "@/shared/api/task";
import { getCompletedTaskIdsByDate, getTasksByDateOnce } from "./queries";

/**
 * 미완료 태스크만 필터링합니다.
 */
export const getUncompletedTasks = (
  tasks: Task[],
  completedTaskIds: Set<string>
) => tasks.filter((task) => !completedTaskIds.has(task.id));

/**
 * 태스크 목록과 완료 ID를 함께 조회합니다.
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

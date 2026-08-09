import { getTasksByDateOnce, type Task } from "@/shared/api/task";
import { getTaskLogRecordsByDate } from "./queries";

/**
 * 미완료 태스크만 필터링합니다.
 */
export const getUncompletedTasks = (
  tasks: Task[],
  completedTaskIds: Set<string>
) => tasks.filter((task) => !completedTaskIds.has(task.id));

/**
 * 태스크 목록과 그날의 완료 기록을 함께 조회합니다.
 *
 * 기록 원본(taskLogs)도 돌려줘, 할 일을 지우는 작업이 추가 조회 없이
 * 딸린 기록까지 같은 배치에서 지울 수 있게 한다.
 */
export const fetchTasksAndCompleted = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}) => {
  const [tasks, taskLogs] = await Promise.all([
    getTasksByDateOnce({ userId, date }),
    getTaskLogRecordsByDate({ userId, date }),
  ]);

  const completedTaskIds = new Set(
    taskLogs.filter((log) => log.completed).map((log) => log.taskId)
  );

  return { tasks, completedTaskIds, taskLogs };
};

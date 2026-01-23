import type { Task } from "@/shared/api/task";
import { getCompletedTaskIdsByDate, getTasksByDateOnce } from "./queries";

export const getUncompletedTasks = (
  tasks: Task[],
  completedTaskIds: Set<string>
) => tasks.filter((task) => !completedTaskIds.has(task.id));

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

import { getDocs, query, where } from "firebase/firestore";
import type { Task } from "@/shared/api/task";
import { mapTask } from "@/shared/api/task/mappers";
import { taskLogsRef, tasksRef } from "./refs";

type TaskLogRecord = {
  taskId: string;
  completed: boolean;
};

export const getTasksByDateOnce = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<Task[]> => {
  const q = query(tasksRef(userId), where("date", "==", date));

  const snap = await getDocs(q);

  return snap.docs.map(mapTask);
};

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

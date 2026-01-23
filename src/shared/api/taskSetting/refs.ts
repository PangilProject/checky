import { userCollection, userDoc } from "@/shared/api/_common/refs";

export const tasksRef = (userId: string) =>
  userCollection(userId, "tasks");

export const taskRef = (userId: string, taskId: string) =>
  userDoc(userId, "tasks", taskId);

export const taskLogsRef = (userId: string) =>
  userCollection(userId, "taskLogs");

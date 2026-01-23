import { userCollection, userDoc } from "@/shared/api/_common/refs";

export const taskLogsRef = (userId: string) =>
  userCollection(userId, "taskLogs");

export const taskLogRef = (userId: string, logId: string) =>
  userDoc(userId, "taskLogs", logId);

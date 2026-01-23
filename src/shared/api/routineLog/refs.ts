import { userCollection, userDoc } from "@/shared/api/_common/refs";

export const routineLogsRef = (userId: string) =>
  userCollection(userId, "routineLogs");

export const routineLogRef = (userId: string, logId: string) =>
  userDoc(userId, "routineLogs", logId);

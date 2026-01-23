import { userCollection, userDoc } from "@/shared/api/_common/refs";

export const routinesRef = (userId: string) =>
  userCollection(userId, "routines");

export const routineRef = (userId: string, routineId: string) =>
  userDoc(userId, "routines", routineId);

export const routineLogsRef = (userId: string) =>
  userCollection(userId, "routineLogs");

export const categoriesRef = (userId: string) =>
  userCollection(userId, "categories");

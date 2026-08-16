import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * 태스크 컬렉션 레퍼런스를 반환합니다.
 */
export const tasksRef = (userId: string) =>
  userCollection(userId, "tasks");

/**
 * 태스크 문서 레퍼런스를 반환합니다.
 */
export const taskRef = (userId: string, taskId: string) =>
  userDoc(userId, "tasks", taskId);


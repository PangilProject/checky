import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * @description 태스크 로그 컬렉션 레퍼런스를 반환합니다.
 */
export const taskLogsRef = (userId: string) =>
  userCollection(userId, "taskLogs");

/**
 * @description 태스크 로그 문서 레퍼런스를 반환합니다.
 * @param logId 로그 ID
 */
export const taskLogRef = (userId: string, logId: string) =>
  userDoc(userId, "taskLogs", logId);

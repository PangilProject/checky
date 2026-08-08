import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * @description 루틴 로그 컬렉션 레퍼런스를 반환합니다.
 */
export const routineLogsRef = (userId: string) =>
  userCollection(userId, "routineLogs");

/**
 * @description 루틴 로그 문서 레퍼런스를 반환합니다.
 * @param logId 로그 ID
 */
export const routineLogRef = (userId: string, logId: string) =>
  userDoc(userId, "routineLogs", logId);

/**
 * @file routineLog/refs.ts
 * @description API 모듈
 */

import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * @description 루틴 로그 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const routineLogsRef = (userId: string) =>
  userCollection(userId, "routineLogs");

/**
 * @description 루틴 로그 문서 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @param logId 로그 ID
 * @returns 레퍼런스
 */
export const routineLogRef = (userId: string, logId: string) =>
  userDoc(userId, "routineLogs", logId);

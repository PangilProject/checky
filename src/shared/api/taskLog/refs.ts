/**
 * @file taskLog/refs.ts
 * @description API 모듈
 */

import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * @description 태스크 로그 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const taskLogsRef = (userId: string) =>
  userCollection(userId, "taskLogs");

/**
 * @description 태스크 로그 문서 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @param logId 로그 ID
 * @returns 레퍼런스
 */
export const taskLogRef = (userId: string, logId: string) =>
  userDoc(userId, "taskLogs", logId);

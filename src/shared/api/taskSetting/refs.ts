/**
 * @file taskSetting/refs.ts
 * @description API 모듈
 */

import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * @description 태스크 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const tasksRef = (userId: string) =>
  userCollection(userId, "tasks");

/**
 * @description 태스크 문서 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @param taskId 태스크 ID
 * @returns 레퍼런스
 */
export const taskRef = (userId: string, taskId: string) =>
  userDoc(userId, "tasks", taskId);

/**
 * @description 태스크 로그 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const taskLogsRef = (userId: string) =>
  userCollection(userId, "taskLogs");

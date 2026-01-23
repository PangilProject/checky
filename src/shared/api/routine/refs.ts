/**
 * @file routine/refs.ts
 * @description API 모듈
 */

import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * @description 루틴 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const routinesRef = (userId: string) =>
  userCollection(userId, "routines");

/**
 * @description 루틴 문서 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @param routineId 루틴 ID
 * @returns 레퍼런스
 */
export const routineRef = (userId: string, routineId: string) =>
  userDoc(userId, "routines", routineId);

/**
 * @description 루틴 로그 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const routineLogsRef = (userId: string) =>
  userCollection(userId, "routineLogs");

/**
 * @description 카테고리 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const categoriesRef = (userId: string) =>
  userCollection(userId, "categories");

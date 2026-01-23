/**
 * @file category/refs.ts
 * @description API 모듈
 */

import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * @description 카테고리 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @returns 레퍼런스
 */
export const categoriesRef = (userId: string) =>
  userCollection(userId, "categories");

/**
 * @description categoryRef 동작을 수행합니다.
 * @param userId 사용자 ID
 * @param categoryId 카테고리 ID
 * @returns 반환값
 */
export const categoryRef = (userId: string, categoryId: string) =>
  userDoc(userId, "categories", categoryId);

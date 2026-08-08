import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * 카테고리 컬렉션 레퍼런스를 반환합니다.
 */
export const categoriesRef = (userId: string) =>
  userCollection(userId, "categories");

export const categoryRef = (userId: string, categoryId: string) =>
  userDoc(userId, "categories", categoryId);

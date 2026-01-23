/**
 * @file category/order.ts
 * @description API 모듈
 */

import { writeBatch } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { categoryRef } from "./refs";

/**
 * @description 카테고리 정렬 순서를 업데이트합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const updateCategoryOrder = async ({
  userId,
  categories,
}: {
  userId: string;
  categories: { id: string; orderIndex: number }[];
}) => {
  const batch = writeBatch(db);

  categories.forEach(({ id, orderIndex }) => {
    batch.update(categoryRef(userId, id), { orderIndex });
  });

  await batch.commit();
};

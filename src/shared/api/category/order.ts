import { writeBatch } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { categoryRef } from "./refs";

/**
 * 분류 정렬 순서를 한 번에 저장한다.
 *
 * 배치 쓰기라 전부 반영되거나 전부 실패한다.
 * Firestore 배치 한도가 500건이므로 한 번에 넘기는 항목이 그보다 적어야 한다.
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

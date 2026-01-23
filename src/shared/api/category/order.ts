import { writeBatch } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { categoryRef } from "./refs";

// 카테고리 순번 바꾸기
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

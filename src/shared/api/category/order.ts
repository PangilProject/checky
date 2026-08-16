import { updateOrderBatch } from "@/shared/api/_common/order";
import { categoryRef } from "./refs";

/** 분류 정렬 순서를 한 번에 저장한다. */
export const updateCategoryOrder = async ({
  userId,
  categories,
}: {
  userId: string;
  categories: { id: string; orderIndex: number }[];
}) => updateOrderBatch((id) => categoryRef(userId, id), categories);

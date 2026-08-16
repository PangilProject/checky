import { updateOrderBatch } from "@/shared/api/_common/order";
import { taskRef } from "./refs";

/** 할 일 정렬 순서를 한 번에 저장한다. */
export const updateTaskOrder = async ({
  userId,
  tasks,
}: {
  userId: string;
  tasks: { id: string; orderIndex: number }[];
}) => updateOrderBatch((id) => taskRef(userId, id), tasks);

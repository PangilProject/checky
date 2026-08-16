import { updateOrderBatch } from "@/shared/api/_common/order";
import { routineRef } from "./refs";

/** 루틴 정렬 순서를 한 번에 저장한다. */
export const updateRoutineOrder = async ({
  userId,
  routines,
}: {
  userId: string;
  routines: { id: string; orderIndex: number }[];
}) => updateOrderBatch((id) => routineRef(userId, id), routines);

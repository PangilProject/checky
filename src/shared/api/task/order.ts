import { writeBatch } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { taskRef } from "./refs";

/**
 * 할 일 정렬 순서를 한 번에 저장한다.
 *
 * 배치 쓰기라 전부 반영되거나 전부 실패한다. 순서가 절반만 바뀌는 일은 없다.
 * Firestore 배치 한도가 500건이므로 한 번에 넘기는 항목이 그보다 적어야 한다.
 */
export const updateTaskOrder = async ({
  userId,
  tasks,
}: {
  userId: string;
  tasks: { id: string; orderIndex: number }[];
}) => {
  const batch = writeBatch(db);

  tasks.forEach(({ id, orderIndex }) => {
    batch.update(taskRef(userId, id), {
      orderIndex,
    });
  });

  await batch.commit();
};

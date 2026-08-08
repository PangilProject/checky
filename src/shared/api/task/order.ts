import {
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { taskRef, tasksRef } from "./refs";

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

/**
 * orderIndex 가 없던 시절에 만들어진 할 일에 순서를 채워 넣는다.
 *
 * 사용자의 할 일 전체를 읽으므로 문서 수만큼 비용이 든다.
 * 채울 것이 없으면 쓰기를 하지 않는다.
 */
export const migrateTaskOrderIndex = async (userId: string) => {
  const snap = await getDocs(query(tasksRef(userId), orderBy("createdAt", "asc")));

  const batch = writeBatch(db);
  let needCommit = false;

  const groupMap = new Map<
    string,
    Array<{ ref: DocumentReference<DocumentData>; data: DocumentData }>
  >();

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const key = `${data.date}_${data.categoryId}`;

    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push({ ref: docSnap.ref, data });
  });

  groupMap.forEach((items) => {
    items.forEach((item, index) => {
      if (typeof item.data.orderIndex === "number") return;

      needCommit = true;
      batch.update(item.ref, {
        orderIndex: index,
        updatedAt: serverTimestamp(),
      });
    });
  });

  if (needCommit) {
    await batch.commit();
  }
};

/**
 * @file task/order.ts
 * @description API 모듈
 */

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
 * @description 태스크 정렬 순서를 업데이트합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
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
 * @description 태스크 orderIndex를 마이그레이션합니다.
 * @param userId 사용자 ID
 * @returns 작업 결과
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
    console.log("[Task] orderIndex migration done");
  }
};

/**
 * @file routine/order.ts
 * @description API 모듈
 */

import { getDocs, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { routineRef, routinesRef } from "./refs";

/**
 * @description 루틴 정렬 순서를 업데이트합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const updateRoutineOrder = async ({
  userId,
  routines,
}: {
  userId: string;
  routines: { id: string; orderIndex: number }[];
}) => {
  const batch = writeBatch(db);

  routines.forEach(({ id, orderIndex }) => {
    batch.update(routineRef(userId, id), {
      orderIndex,
    });
  });

  await batch.commit();
};

/**
 * @description 루틴 orderIndex를 마이그레이션합니다.
 * @param userId 사용자 ID
 * @returns 작업 결과
 */
export const migrateRoutineOrderIndex = async (userId: string) => {
  const snap = await getDocs(
    query(routinesRef(userId), orderBy("createdAt", "asc"))
  );

  const batch = writeBatch(db);
  let needCommit = false;

  snap.docs.forEach((docSnap, index) => {
    const data = docSnap.data();

    if (typeof data.orderIndex === "number") return;

    needCommit = true;

    batch.update(docSnap.ref, {
      orderIndex: index,
      updatedAt: serverTimestamp(),
    });
  });

  if (needCommit) {
    await batch.commit();
    console.log("[Routine] orderIndex migration done");
  }
};

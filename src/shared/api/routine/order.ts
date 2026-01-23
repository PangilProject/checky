import { getDocs, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { routineRef, routinesRef } from "./refs";

// 루틴 순서 변경
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

// 마이그레이션
export const migrateRoutineOrderIndex = async (userId: string) => {
  // 🔹 기존 루틴 전체를 createdAt 기준으로 가져오기
  const snap = await getDocs(
    query(routinesRef(userId), orderBy("createdAt", "asc"))
  );

  const batch = writeBatch(db);
  let needCommit = false;

  snap.docs.forEach((docSnap, index) => {
    const data = docSnap.data();

    // ✅ 이미 orderIndex 있으면 스킵
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

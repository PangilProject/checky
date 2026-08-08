import { getDocs, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { routineRef, routinesRef } from "./refs";

const migratedUsers = new Set<string>();

/**
 * 루틴 정렬 순서를 한 번에 저장한다.
 *
 * 배치 쓰기라 전부 반영되거나 전부 실패한다.
 * Firestore 배치 한도가 500건이므로 한 번에 넘기는 항목이 그보다 적어야 한다.
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
 * orderIndex 가 없던 시절에 만들어진 루틴에 순서를 채워 넣는다.
 *
 * 사용자의 루틴 전체를 읽으므로, 이미 끝난 사용자는 다시 읽지 않도록
 * 모듈 수준 Set 에 기록해 둔다. 이 기록은 메모리에만 있어 새로고침하면 사라진다.
 * 채울 것이 없으면 쓰기를 하지 않으므로 다시 돌아도 안전하다.
 */
export const migrateRoutineOrderIndex = async (userId: string) => {
  if (migratedUsers.has(userId)) return;

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
  }

  migratedUsers.add(userId);
};

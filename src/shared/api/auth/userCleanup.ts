import { db } from "@/firebase/firebase";
import { collection, getDocs, writeBatch } from "firebase/firestore/lite";
import { deleteUserDoc } from "./user";

/**
 * 회원 탈퇴 시 사용자와 연결된 Firestore 데이터를 지운다.
 */

const USER_SUB_COLLECTIONS = [
  "tasks",
  "taskLogs",
  "routines",
  "routineLogs",
  "categories",
  "monthlyStats",
] as const;

// 문서마다 개별 요청을 병렬로 쏘면 데이터가 많은 사용자의 탈퇴에서
// 수천 개 요청이 한꺼번에 나가 일부만 실패한 채 끝날 수 있다.
// 배치 한도(500) 단위로 순차 커밋해 요청 수와 실패 단위를 줄인다.
const deleteSubCollection = async (uid: string, subCollection: string) => {
  const ref = collection(db, "users", uid, subCollection);
  const snap = await getDocs(ref);

  const BATCH_LIMIT = 500;
  for (let start = 0; start < snap.docs.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snap.docs
      .slice(start, start + BATCH_LIMIT)
      .forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  }
};

/**
 * 사용자에게 딸린 Firestore 데이터를 전부 지운다.
 *
 * 하위 컬렉션 여섯 종을 비운 뒤 프로필 문서를 지운다.
 * 목록에 빠진 컬렉션이 있으면 탈퇴 후에도 데이터가 남으므로,
 * 하위 컬렉션을 새로 만들면 USER_SUB_COLLECTIONS 에도 반드시 넣어야 한다.
 */
export const deleteAllUserData = async (uid: string) => {
  await Promise.all(
    USER_SUB_COLLECTIONS.map((name) => deleteSubCollection(uid, name))
  );

  await deleteUserDoc(uid);
};

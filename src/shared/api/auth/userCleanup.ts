import { db } from "@/firebase/firebase";
import { collection, deleteDoc, getDocs } from "firebase/firestore/lite";
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

const deleteSubCollection = async (uid: string, subCollection: string) => {
  const ref = collection(db, "users", uid, subCollection);
  const snap = await getDocs(ref);

  await Promise.all(snap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
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

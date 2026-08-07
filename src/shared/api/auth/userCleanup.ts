import { db } from "@/firebase/firebase";
import { collection, deleteDoc, getDocs } from "firebase/firestore/lite";
import { deleteUserDoc } from "./user";

/**
 * @file userCleanup.ts
 * @description 사용자 탈퇴 시 연관 Firestore 데이터 삭제 유틸
 */

/** 삭제 대상 하위 컬렉션 목록 */
const USER_SUB_COLLECTIONS = [
  "tasks",
  "taskLogs",
  "routines",
  "routineLogs",
  "categories",
  "monthlyStats",
] as const;

/** users/{uid}/{subCollection} 하위 문서를 일괄 삭제합니다. */
const deleteSubCollection = async (uid: string, subCollection: string) => {
  const ref = collection(db, "users", uid, subCollection);
  const snap = await getDocs(ref);

  await Promise.all(snap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
};

/**
 * 사용자와 연관된 Firestore 데이터를 정리합니다.
 * 하위 컬렉션 전체와 users 문서를 삭제합니다.
 */
export const deleteAllUserData = async (uid: string) => {
  await Promise.all(
    USER_SUB_COLLECTIONS.map((name) => deleteSubCollection(uid, name))
  );

  await deleteUserDoc(uid);
};

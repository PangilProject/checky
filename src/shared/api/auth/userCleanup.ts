import { db } from "@/firebase/firebase";
import { collection, deleteDoc, getDocs } from "firebase/firestore/lite";
import { deleteUserDoc } from "./user";

/**
 * @file userCleanup.ts
 * @description 사용자 탈퇴 시 연관 Firestore 데이터 삭제 유틸
 */

/** users/{uid}/{subCollection} 하위 문서를 일괄 삭제합니다. */
const deleteSubCollection = async (uid: string, subCollection: string) => {
  const ref = collection(db, "users", uid, subCollection);
  const snap = await getDocs(ref);

  await Promise.all(snap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
};

/**
 * 사용자와 연관된 Firestore 데이터를 정리합니다.
 * tasks, taskLogs, routines, routineLogs, categories, users 문서를 삭제합니다.
 */
export const deleteAllUserData = async (uid: string) => {
  await Promise.all([
    deleteSubCollection(uid, "tasks"),
    deleteSubCollection(uid, "taskLogs"),
    deleteSubCollection(uid, "routines"),
    deleteSubCollection(uid, "routineLogs"),
    deleteSubCollection(uid, "categories"),
  ]);

  await deleteUserDoc(uid);
};

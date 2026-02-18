import { db } from "@/firebase/firebase";
import { collection, deleteDoc, getDocs } from "firebase/firestore/lite";
import { deleteUserDoc } from "./user.repository";

const deleteSubCollection = async (uid: string, subCollection: string) => {
  const ref = collection(db, "users", uid, subCollection);
  const snap = await getDocs(ref);

  await Promise.all(snap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
};

/** 사용자와 연관된 모든 Firestore 데이터 삭제 */
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

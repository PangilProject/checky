import { db } from "@/firebase/firebase";
import type { User } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore/lite";

/** 사용자 문서 조회 */
export const getUserDoc = async (uid: string) => {
  return await getDoc(doc(db, "users", uid));
};

/** 최초 로그인 시 사용자 생성 */
export const createUser = async (user: User) => {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    name: user.displayName ?? "",
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
};

/** 재로그인 시 마지막 로그인 갱신 */
export const updateLastLogin = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/** 사용자 문서 삭제 */
export const deleteUserDoc = async (uid: string) => {
  await deleteDoc(doc(db, "users", uid));
};

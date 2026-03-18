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

/**
 * @file user.ts
 * @description users 컬렉션 문서 CRUD 유틸
 */

/** users/{uid} 문서를 조회합니다. */
export const getUserDoc = async (uid: string) => {
  return await getDoc(doc(db, "users", uid));
};

/** 최초 로그인 사용자의 기본 프로필 문서를 생성합니다. */
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

/** 재로그인 시 마지막 로그인 시간을 갱신합니다. */
export const updateLastLogin = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/** users/{uid} 문서를 삭제합니다. */
export const deleteUserDoc = async (uid: string) => {
  await deleteDoc(doc(db, "users", uid));
};

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
 * users 컬렉션 문서를 만들고 읽고 지운다.
 */

export const getUserDoc = async (uid: string) => {
  return await getDoc(doc(db, "users", uid));
};

export const createUser = async (user: User) => {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    name: user.displayName ?? "",
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });
};

/**
 * 마지막 접속 시각을 갱신합니다.
 * lastLoginAt은 구글 인증을 실제로 수행할 때만 갱신되므로, 세션이 유지되는 동안
 * 계속 사용하는 사용자는 값이 오래된 채 남습니다. 실사용 여부를 판단하려면
 * 세션으로 앱을 열었을 때도 기록이 필요합니다.
 */
export const updateLastActive = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    lastActiveAt: serverTimestamp(),
  });
};

export const updateLastLogin = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteUserDoc = async (uid: string) => {
  await deleteDoc(doc(db, "users", uid));
};

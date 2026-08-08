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

/** 사용자 문서를 읽는다. 최초 로그인인지 판단할 때 쓴다. */
export const getUserDoc = async (uid: string) => {
  return await getDoc(doc(db, "users", uid));
};

/** 최초 로그인한 사용자의 프로필 문서를 만든다. Google 계정에서 받은 값을 그대로 담는다. */
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
 * 마지막 접속 시각을 기록한다.
 *
 * lastLoginAt 은 구글 인증을 실제로 거칠 때만 갱신되므로, 세션이 유지되는 동안
 * 계속 쓰는 사용자는 값이 오래된 채 남는다. 실사용 여부를 보려면
 * 세션으로 앱을 열었을 때도 기록이 필요하다.
 */
export const updateLastActive = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    lastActiveAt: serverTimestamp(),
  });
};

/** 구글 인증을 다시 거쳤을 때 마지막 로그인 시각을 갱신한다. */
export const updateLastLogin = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/** 사용자 프로필 문서를 지운다. 하위 데이터는 따로 지워야 한다. */
export const deleteUserDoc = async (uid: string) => {
  await deleteDoc(doc(db, "users", uid));
};

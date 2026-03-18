import { auth, googleProvider } from "@/firebase/firebase";
import {
  deleteUser,
  reauthenticateWithPopup,
  signInWithPopup,
} from "firebase/auth";
import { createUser, getUserDoc, updateLastLogin } from "./user";
import { deleteAllUserData } from "./userCleanup";

/**
 * @file auth.ts
 * @description Google 인증 및 계정 삭제 액션
 */

/**
 * Google 로그인 + 사용자 문서 동기화
 * - 최초 로그인: users 문서 생성
 * - 재로그인: lastLoginAt 갱신
 */
export const signInWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, googleProvider);

  const snap = await getUserDoc(user.uid);

  if (!snap.exists()) {
    await createUser(user);
  } else {
    await updateLastLogin(user.uid);
  }

  return user;
};

/**
 * 계정 완전 삭제
 * - 재인증 후 사용자 하위 데이터 삭제
 * - Firebase Auth 계정 삭제
 */
export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인된 유저가 없습니다.");

  await reauthenticateWithPopup(user, googleProvider);

  await deleteAllUserData(user.uid);
  await deleteUser(user);
};

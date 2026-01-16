import { auth, googleProvider } from "@/firebase/firebase";
import {
  deleteUser,
  reauthenticateWithPopup,
  signInWithPopup,
} from "firebase/auth";
import {
  createUser,
  getUserDoc,
  updateLastLogin,
} from "../user/user.repository";
import { deleteAllUserData } from "../user/user-cleanup.service";

/** Google 로그인 + 사용자 동기화 */
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

/** 계정 완전 삭제 */
export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인된 유저가 없습니다.");

  await reauthenticateWithPopup(user, googleProvider);

  await deleteAllUserData(user.uid);
  await deleteUser(user);
};

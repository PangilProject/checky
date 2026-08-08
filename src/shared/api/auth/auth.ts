import { auth, googleProvider } from "@/firebase/firebase";
import {
  deleteUser,
  reauthenticateWithPopup,
  signInWithPopup,
} from "firebase/auth";
import { createUser, getUserDoc, updateLastLogin } from "./user";
import { deleteAllUserData } from "./userCleanup";

/**
 * Google 인증과 계정 삭제 동작을 모은다.
 */

/**
 * Google 계정으로 로그인하고 사용자 문서를 맞춘다.
 *
 * 처음이면 프로필 문서를 만들고, 이미 있으면 마지막 로그인 시각만 갱신한다.
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
 * 계정 삭제가 데이터 삭제까지는 성공했지만 Auth 계정 삭제에서 실패한 경우.
 * 이 상태에서는 재시도가 필요하다는 사실을 사용자에게 알려야 한다.
 */
export class AccountDeletionIncompleteError extends Error {
  constructor() {
    super("계정 삭제가 완료되지 않았습니다.");
    this.name = "AccountDeletionIncompleteError";
  }
}

/**
 * 계정과 데이터를 모두 지운다.
 *
 * 본인 확인을 위해 재인증한 뒤 Firestore 데이터를 지우고, 마지막에 Auth 계정을 지운다.
 * 데이터 삭제는 Firestore 규칙상 로그인 상태에서만 가능하므로 Auth 계정 삭제를
 * 마지막에 수행한다. 마지막 단계가 실패하면 데이터만 지워진 어중간한 상태가 되므로
 * 한 번 재시도한 뒤, 그래도 실패하면 재시도가 필요함을 알리는 에러를 던진다.
 */
export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인된 유저가 없습니다.");

  // 재인증: 실패해도 데이터는 아직 그대로이므로 안전하게 중단된다
  await reauthenticateWithPopup(user, googleProvider);

  await deleteAllUserData(user.uid);

  try {
    await deleteUser(user);
  } catch {
    try {
      await deleteUser(user);
    } catch {
      throw new AccountDeletionIncompleteError();
    }
  }
};

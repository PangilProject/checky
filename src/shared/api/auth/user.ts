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

/** uid -> 진행 중인 보장 요청. 같은 사용자에 대해 생성이 두 번 일어나지 않게 한다. */
const ensureInFlight = new Map<string, Promise<{ created: boolean }>>();

/**
 * 프로필 문서가 있는지 확인하고, 없으면 만든다.
 *
 * 로그인 함수가 아니라 인증 구독에서도 부르기 위한 함수다. 구독은 앱을 열 때마다
 * 실행되므로, 가입 도중 창을 닫거나 쓰기가 실패해 프로필 없이 남은 계정이
 * 다음 접속에서 스스로 복구된다. Auth 세션은 프로필보다 먼저 확정·저장되기 때문에
 * 생성을 로그인 함수에만 맡기면 그 계정은 다시 만들 기회를 영영 얻지 못한다.
 *
 * 로그인 함수와 구독이 동시에 부를 수 있어 진행 중인 요청을 공유한다.
 */
export const ensureUserProfile = async (
  user: User
): Promise<{ created: boolean }> => {
  const pending = ensureInFlight.get(user.uid);
  if (pending) return pending;

  const request = (async () => {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) return { created: false };

    await createUser(user);
    return { created: true };
  })();

  ensureInFlight.set(user.uid, request);
  try {
    return await request;
  } finally {
    ensureInFlight.delete(user.uid);
  }
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

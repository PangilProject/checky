import {
  deleteUser,
  reauthenticateWithPopup,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, googleProvider, db } from "@/firebase/firebase";

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // 1. 최초 로그인 (회원가입)
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName ?? "",
      photoURL: user.photoURL ?? null,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    // 2. 재로그인
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return user;
};

export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인된 유저가 없습니다.");

  // ✅ 1. 재인증 (Google 로그인 기준)
  await reauthenticateWithPopup(user, googleProvider);

  const uid = user.uid;

  // ✅ 2. Firestore 데이터 삭제
  await deleteUserData(uid);

  // ✅ 3. Authentication 계정 삭제
  await deleteUser(user);
};

const deleteSubCollection = async (uid: string, subCollection: string) => {
  const ref = collection(db, "users", uid, subCollection);
  const snap = await getDocs(ref);

  await Promise.all(snap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
};

export const deleteUserData = async (uid: string) => {
  // 🔥 하위 컬렉션들
  await Promise.all([
    deleteSubCollection(uid, "tasks"),
    deleteSubCollection(uid, "taskLogs"),
    deleteSubCollection(uid, "routines"),
    deleteSubCollection(uid, "routineLogs"),
    deleteSubCollection(uid, "categories"),
  ]);

  // 🔥 users/{uid} 문서 삭제
  await deleteDoc(doc(db, "users", uid));
};

import { signInWithPopup } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "@/services/firebase/firebase";

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

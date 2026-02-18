// import {
//   deleteUser,
//   reauthenticateWithPopup,
//   signInWithPopup,
// } from "firebase/auth";
// import {
//   doc,
//   getDoc,
//   setDoc,
//   updateDoc,
//   serverTimestamp,
//   collection,
//   getDocs,
//   deleteDoc,
// } from "firebase/firestore/lite";
// import { auth, googleProvider, db } from "@/firebase/firebase";

// /**
//  * Google Popup 로그인을 수행하고,
//  * 최초 로그인 시 Firestore에 사용자 문서를 생성한다.
//  *
//  * @async
//  * @returns {Promise<import("firebase/auth").User>} 로그인된 Firebase User 객체
//  */
// export const signInWithGoogle = async () => {
//   const result = await signInWithPopup(auth, googleProvider);
//   const user = result.user;

//   const userRef = doc(db, "users", user.uid);
//   const snap = await getDoc(userRef);

//   if (!snap.exists()) {
//     // 1. 최초 로그인 (회원가입)
//     await setDoc(userRef, {
//       uid: user.uid,
//       email: user.email,
//       name: user.displayName ?? "",
//       photoURL: user.photoURL ?? null,

//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//       lastLoginAt: serverTimestamp(),
//     });
//   } else {
//     // 2. 재로그인
//     await updateDoc(userRef, {
//       lastLoginAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     });
//   }

//   return user;
// };

// /**
//  * 현재 로그인된 사용자의 계정을 완전히 삭제한다.
//  *
//  * 처리 순서:
//  * 1. Google 재인증
//  * 2. Firestore 사용자 데이터 삭제
//  * 3. Firebase Authentication 계정 삭제
//  *
//  * @async
//  * @throws {Error} 로그인된 유저가 없을 경우
//  */
// export const deleteAccount = async () => {
//   const user = auth.currentUser;
//   if (!user) throw new Error("로그인된 유저가 없습니다.");

//   // ✅ 1. 재인증 (Google 로그인 기준)
//   await reauthenticateWithPopup(user, googleProvider);

//   const uid = user.uid;

//   // ✅ 2. Firestore 데이터 삭제
//   await deleteUserData(uid);

//   // ✅ 3. Authentication 계정 삭제
//   await deleteUser(user);
// };

// /**
//  * 특정 사용자의 하위 컬렉션에 포함된 모든 문서를 삭제한다.
//  *
//  * @async
//  * @param {string} uid - 사용자 UID
//  * @param {string} subCollection - 삭제할 하위 컬렉션 이름
//  */
// const deleteSubCollection = async (uid: string, subCollection: string) => {
//   const ref = collection(db, "users", uid, subCollection);
//   const snap = await getDocs(ref);

//   await Promise.all(snap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
// };

// /**
//  * Firestore에 저장된 사용자 관련 모든 데이터를 삭제한다.
//  *
//  * 삭제 대상:
//  * - tasks
//  * - taskLogs
//  * - routines
//  * - routineLogs
//  * - categories
//  * - users/{uid} 문서
//  *
//  * @async
//  * @param {string} uid - 사용자 UID
//  */
// export const deleteUserData = async (uid: string) => {
//   // 🔥 하위 컬렉션들
//   await Promise.all([
//     deleteSubCollection(uid, "tasks"),
//     deleteSubCollection(uid, "taskLogs"),
//     deleteSubCollection(uid, "routines"),
//     deleteSubCollection(uid, "routineLogs"),
//     deleteSubCollection(uid, "categories"),
//   ]);

//   // 🔥 users/{uid} 문서 삭제
//   await deleteDoc(doc(db, "users", uid));
// };

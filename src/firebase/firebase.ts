import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

/*
  E2E 테스트(`vite --mode e2e`)에서만 에뮬레이터에 붙는다.
  배포 빌드는 mode 가 production 이라 이 블록과 위의 에뮬레이터 import 가 통째로 빠진다.

  실제 Google 팝업은 자동화할 수 없어, 에뮬레이터가 받아 주는 가짜 Google 토큰으로
  로그인하는 통로를 window 에 열어 둔다. 공급자가 google.com 으로 남아 실제 로그인과 같은 경로를 탄다.
*/
if (import.meta.env.MODE === "e2e") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);

  Object.assign(window, {
    __e2eSignIn: (uid: string) =>
      signInWithCredential(
        auth,
        GoogleAuthProvider.credential(
          JSON.stringify({
            sub: uid,
            email: `${uid}@e2e.test`,
            email_verified: true,
            name: "E2E 사용자",
          }),
        ),
      ).then(() => undefined),
  });
}

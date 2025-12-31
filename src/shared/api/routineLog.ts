// routineLog.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

export const toggleRoutineLog = async ({
  userId,
  routineId,
  date,
  done,
}: {
  userId: string;
  routineId: string;
  date: string;
  done: boolean;
}) => {
  const logId = `${routineId}_${date}`; // ✅ deterministic id
  const logRef = doc(db, "users", userId, "routineLogs", logId);

  await setDoc(
    logRef,
    {
      routineId,
      date,
      done,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true } // ✅ 있으면 update, 없으면 create
  );
};

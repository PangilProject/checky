// routineLog.ts
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

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
  const logId = `${routineId}_${date}`;
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
    { merge: true }
  );
};

import { serverTimestamp, setDoc } from "firebase/firestore";
import { routineLogRef } from "./refs";

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
  const logRef = routineLogRef(userId, logId);

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

import { serverTimestamp, setDoc } from "firebase/firestore/lite";
import { routineLogRef } from "./refs";

/**
 * 루틴의 특정 날짜 수행 여부를 저장한다.
 *
 * 문서 ID 를 `{routineId}_{date}` 로 고정한 병합 쓰기라 몇 번을 불러도 결과가 같다.
 * 쓰기 1회이며 기존 문서를 먼저 읽지 않는다.
 */
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

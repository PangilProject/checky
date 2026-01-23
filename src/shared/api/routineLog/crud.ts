/**
 * @file routineLog/crud.ts
 * @description API 모듈
 */

import { serverTimestamp, setDoc } from "firebase/firestore";
import { routineLogRef } from "./refs";

/**
 * @description 루틴 로그를 생성/갱신합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
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

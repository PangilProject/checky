/**
 * @file taskLog/crud.ts
 * @description API 모듈
 */

import { serverTimestamp, setDoc, updateDoc } from "firebase/firestore/lite";
import { taskLogRef } from "./refs";
import type { TaskLog } from "./types";

/**
 * @description 태스크 로그를 생성/토글합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const toggleTaskLog = async ({
  userId,
  taskId,
  date,
  currentLog,
}: {
  userId: string;
  taskId: string;
  date: string;
  currentLog?: TaskLog;
}) => {
  const canonicalLogRef = taskLogRef(userId, `${taskId}_${date}`);
  const nextCompleted = currentLog ? !currentLog.completed : true;

  if (!currentLog || currentLog.id.startsWith("temp-")) {
    await setDoc(
      canonicalLogRef,
      {
        taskId,
        date,
        completed: nextCompleted,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  try {
    await updateDoc(taskLogRef(userId, currentLog.id), {
      completed: nextCompleted,
      updatedAt: serverTimestamp(),
    });
  } catch {
    await setDoc(
      canonicalLogRef,
      {
        taskId,
        date,
        completed: nextCompleted,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

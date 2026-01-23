/**
 * @file taskLog/crud.ts
 * @description API 모듈
 */

import { addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { taskLogRef, taskLogsRef } from "./refs";
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
  const logsRef = taskLogsRef(userId);

  if (!currentLog) {
    await addDoc(logsRef, {
      taskId,
      date,
      completed: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(taskLogRef(userId, currentLog.id), {
    completed: !currentLog.completed,
    updatedAt: serverTimestamp(),
  });
};

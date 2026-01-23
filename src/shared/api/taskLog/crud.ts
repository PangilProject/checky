import { addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { taskLogRef, taskLogsRef } from "./refs";
import type { TaskLog } from "./types";

/** 체크 토글 */
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
    // 최초 체크
    await addDoc(logsRef, {
      taskId,
      date,
      completed: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // 기존 로그 토글
  await updateDoc(taskLogRef(userId, currentLog.id), {
    completed: !currentLog.completed,
    updatedAt: serverTimestamp(),
  });
};

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

export interface TaskLog {
  id: string;
  taskId: string;
  date: string;
  completed: boolean;
}

/** 특정 날짜의 taskLogs 구독 */
export const getTaskLogsByDate = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: string;
  onChange: (logs: TaskLog[]) => void;
}) => {
  const logsRef = collection(db, "users", userId, "taskLogs");

  const q = query(logsRef, where("date", "==", date));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TaskLog, "id">),
    }));
    onChange(logs);
  });
};

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
  const logsRef = collection(db, "users", userId, "taskLogs");

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
  await updateDoc(doc(logsRef, currentLog.id), {
    completed: !currentLog.completed,
    updatedAt: serverTimestamp(),
  });
};

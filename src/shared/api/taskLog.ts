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

// 태스크 로그
export const getTaskLogsByMonth = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: Date;
  onChange: (logs: TaskLog[]) => void;
}) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;

  const q = query(
    collection(db, "users", userId, "taskLogs"),
    where("date", ">=", start),
    where("date", "<=", end)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TaskLog, "id">),
    }));

    onChange(logs);
  });
};

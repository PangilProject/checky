import { onSnapshot, query, where } from "firebase/firestore";
import { taskLogsRef } from "./refs";
import type { TaskLog } from "./types";
import { mapDoc } from "@/shared/api/_common/mappers";

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
  const q = query(taskLogsRef(userId), where("date", "==", date));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => mapDoc<TaskLog>(doc));
    onChange(logs);
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
    taskLogsRef(userId),
    where("date", ">=", start),
    where("date", "<=", end)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => mapDoc<TaskLog>(doc));

    onChange(logs);
  });
};

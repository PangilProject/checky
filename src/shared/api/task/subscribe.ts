import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { tasksRef } from "./refs";
import { mapTask } from "./mappers";
import type { Task } from "./types";

/* =========================
   READ (date 기준)
========================= */
export const getTasksByDate = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: string;
  onChange: (tasks: Task[]) => void;
}) => {
  const q = query(
    tasksRef(userId),
    where("date", "==", date),
    orderBy("orderIndex", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(mapTask);

    onChange(tasks);
  });
};

// 월 별 모든 내용
export const getTasksByMonth = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: Date;
  onChange: (tasks: Task[]) => void;
}) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;

  const q = query(
    tasksRef(userId),
    where("date", ">=", start),
    where("date", "<=", end),
    orderBy("date", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(mapTask);

    onChange(tasks);
  });
};

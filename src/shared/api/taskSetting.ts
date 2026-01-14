import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  addDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Task } from "./task";

/* =========================
   Utils
========================= */
const getTasksByDateOnce = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<Task[]> => {
  const q = query(
    collection(db, "users", userId, "tasks"),
    where("date", "==", date)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Task, "id">),
  }));
};

/* =========================
   ACTION 1
   미완료 → 오늘로 이동
========================= */
export const moveUncompletedTasksToToday = async ({
  userId,
  fromDate,
  toDate,
}: {
  userId: string;
  fromDate: string;
  toDate: string;
}) => {
  const tasks = await getTasksByDateOnce({ userId, date: fromDate });

  const logsSnap = await getDocs(
    query(
      collection(db, "users", userId, "taskLogs"),
      where("date", "==", fromDate)
    )
  );

  const completedTaskIds = new Set(
    logsSnap.docs.filter((d) => d.data().completed).map((d) => d.data().taskId)
  );

  const targets = tasks.filter((t) => !completedTaskIds.has(t.id));

  const batch = writeBatch(db);

  targets.forEach((task) => {
    const ref = doc(db, "users", userId, "tasks", task.id);
    batch.update(ref, {
      date: toDate,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

/* =========================
   ACTION 2
   미완료 → 특정 날짜로 이동 (after)
========================= */
export const moveUncompletedTasksToDate = async ({
  userId,
  fromDate,
  toDate,
}: {
  userId: string;
  fromDate: string;
  toDate: string;
}) => {
  const tasks = await getTasksByDateOnce({ userId, date: fromDate });

  // 완료된 task 판별 (taskLogs 기준)
  const logsSnap = await getDocs(
    query(
      collection(db, "users", userId, "taskLogs"),
      where("date", "==", fromDate)
    )
  );

  const completedTaskIds = new Set(
    logsSnap.docs.filter((d) => d.data().completed).map((d) => d.data().taskId)
  );

  const targets = tasks.filter((t) => !completedTaskIds.has(t.id));

  const batch = writeBatch(db);

  targets.forEach((task) => {
    batch.update(doc(db, "users", userId, "tasks", task.id), {
      date: toDate,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

/* =========================
   ACTION 3
   미완료 삭제
========================= */
export const deleteUncompletedTasks = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}) => {
  const tasks = await getTasksByDateOnce({ userId, date });

  const logsSnap = await getDocs(
    query(
      collection(db, "users", userId, "taskLogs"),
      where("date", "==", date)
    )
  );

  const completedTaskIds = new Set(
    logsSnap.docs.filter((d) => d.data().completed).map((d) => d.data().taskId)
  );

  const targets = tasks.filter((t) => !completedTaskIds.has(t.id));

  const batch = writeBatch(db);

  targets.forEach((task) => {
    batch.delete(doc(db, "users", userId, "tasks", task.id));
  });

  await batch.commit();
};

/* =========================
   ACTION 4
   모든 할 일 복사
========================= */
export const copyAllTasksToDate = async ({
  userId,
  fromDate,
  toDate,
}: {
  userId: string;
  fromDate: string;
  toDate: string;
}) => {
  const tasks = await getTasksByDateOnce({ userId, date: fromDate });

  await Promise.all(
    tasks.map((task, index) =>
      addDoc(collection(db, "users", userId, "tasks"), {
        title: task.title,
        categoryId: task.categoryId,
        categoryColor: task.categoryColor,
        date: toDate,
        ...(task.time && { time: task.time }),
        orderIndex: index, // 👉 새 날짜 기준으로 재정렬
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    )
  );
};
/* =========================
   ACTION 5
   모든 할 일 삭제
========================= */
export const deleteAllTasksByDate = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}) => {
  const tasks = await getTasksByDateOnce({ userId, date });

  const batch = writeBatch(db);

  tasks.forEach((task) => {
    batch.delete(doc(db, "users", userId, "tasks", task.id));
  });

  await batch.commit();
};

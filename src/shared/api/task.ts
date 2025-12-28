import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

/* =========================
   Task 타입
========================= */
export interface Task {
  id: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
}

/* =========================
   CREATE
========================= */
export const createTask = async ({
  userId,
  title,
  categoryId,
  categoryColor,
  date,
}: {
  userId: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
}) => {
  const tasksRef = collection(db, "users", userId, "tasks");

  const docRef = await addDoc(tasksRef, {
    title,
    categoryId,
    categoryColor,
    date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    title,
    categoryId,
    categoryColor,
    date,
  } as Task;
};

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
  const tasksRef = collection(db, "users", userId, "tasks");

  const q = query(
    tasksRef,
    where("date", "==", date),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, "id">),
    }));

    onChange(tasks);
  });
};

/* =========================
   UPDATE 
========================= */
export const updateTask = async ({
  userId,
  taskId,
  title,
}: {
  userId: string;
  taskId: string;
  title: string;
}) => {
  const taskRef = doc(db, "users", userId, "tasks", taskId);

  await updateDoc(taskRef, {
    title,
    updatedAt: serverTimestamp(),
  });
};

/* =========================
   DELETE
========================= */
export const deleteTaskWithLogs = async ({
  userId,
  taskId,
}: {
  userId: string;
  taskId: string;
}) => {
  const batch = writeBatch(db);

  // 1️⃣ task 삭제
  const taskRef = doc(db, "users", userId, "tasks", taskId);
  batch.delete(taskRef);

  // 2️⃣ 관련 taskLogs 조회
  const logsRef = collection(db, "users", userId, "taskLogs");
  const q = query(logsRef, where("taskId", "==", taskId));
  const snapshot = await getDocs(q);

  // 3️⃣ taskLogs 전부 삭제
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 4️⃣ 커밋
  await batch.commit();
};

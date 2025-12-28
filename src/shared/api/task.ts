import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
}

interface CreateTaskParams {
  userId: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
}

export const createTask = async ({
  userId,
  title,
  categoryId,
  categoryColor,
  date,
}: CreateTaskParams) => {
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
  };
};

interface getTasksParams {
  userId: string;
  date: string;
  onChange: (tasks: Task[]) => void;
}

export const getTasksByDate = ({ userId, date, onChange }: getTasksParams) => {
  const tasksRef = collection(db, "users", userId, "tasks");

  const q = query(
    tasksRef,
    where("date", "==", date),
    orderBy("createdAt", "asc")
  );

  const tasks = onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, "id">),
    }));

    onChange(tasks);
  });

  return tasks;
};

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

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

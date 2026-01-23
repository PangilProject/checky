import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const tasksRef = (userId: string) =>
  collection(db, "users", userId, "tasks");

export const taskRef = (userId: string, taskId: string) =>
  doc(db, "users", userId, "tasks", taskId);

export const taskLogsRef = (userId: string) =>
  collection(db, "users", userId, "taskLogs");

import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const taskLogsRef = (userId: string) =>
  collection(db, "users", userId, "taskLogs");

export const taskLogRef = (userId: string, logId: string) =>
  doc(db, "users", userId, "taskLogs", logId);

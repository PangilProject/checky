import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const routineLogsRef = (userId: string) =>
  collection(db, "users", userId, "routineLogs");

export const routineLogRef = (userId: string, logId: string) =>
  doc(db, "users", userId, "routineLogs", logId);

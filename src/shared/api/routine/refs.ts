import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const routinesRef = (userId: string) =>
  collection(db, "users", userId, "routines");

export const routineRef = (userId: string, routineId: string) =>
  doc(db, "users", userId, "routines", routineId);

export const routineLogsRef = (userId: string) =>
  collection(db, "users", userId, "routineLogs");

export const categoriesRef = (userId: string) =>
  collection(db, "users", userId, "categories");

import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const categoriesRef = (userId: string) =>
  collection(db, "users", userId, "categories");

export const categoryRef = (userId: string, categoryId: string) =>
  doc(db, "users", userId, "categories", categoryId);

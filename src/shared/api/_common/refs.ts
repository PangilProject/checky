import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const userCollection = (userId: string, collectionName: string) =>
  collection(db, "users", userId, collectionName);

export const userDoc = (
  userId: string,
  collectionName: string,
  docId: string
) => doc(db, "users", userId, collectionName, docId);

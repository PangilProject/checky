import { collection, doc } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";

/**
 * 사용자 하위 컬렉션 레퍼런스를 반환합니다.
 * @param collectionName 컬렉션 이름
 */
export const userCollection = (userId: string, collectionName: string) =>
  collection(db, "users", userId, collectionName);

/**
 * 사용자 하위 문서 레퍼런스를 반환합니다.
 */
export const userDoc = (
  userId: string,
  collectionName: string,
  docId: string
) => doc(db, "users", userId, collectionName, docId);

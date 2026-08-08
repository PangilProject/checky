import { collection, doc } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";

/**
 * users/{uid} 아래 컬렉션을 가리키는 경로를 만든다.
 * 모든 도메인의 refs 가 이 함수를 거쳐 경로를 만들어, 컬렉션 이름이 흩어지지 않게 한다.
 * @param collectionName 컬렉션 이름
 */
export const userCollection = (userId: string, collectionName: string) =>
  collection(db, "users", userId, collectionName);

/**
 * users/{uid} 아래 문서 하나를 가리키는 경로를 만든다.
 */
export const userDoc = (
  userId: string,
  collectionName: string,
  docId: string
) => doc(db, "users", userId, collectionName, docId);

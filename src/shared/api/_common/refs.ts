/**
 * @file _common/refs.ts
 * @description API 모듈
 */

import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

/**
 * @description 사용자 하위 컬렉션 레퍼런스를 반환합니다.
 * @param userId 사용자 ID
 * @param collectionName 컬렉션 이름
 * @returns 레퍼런스
 */
export const userCollection = (userId: string, collectionName: string) =>
  collection(db, "users", userId, collectionName);

/**
 * @description 사용자 하위 문서 레퍼런스를 반환합니다.
 * @param params 요청 파라미터
 * @returns 레퍼런스
 */
export const userDoc = (
  userId: string,
  collectionName: string,
  docId: string
) => doc(db, "users", userId, collectionName, docId);

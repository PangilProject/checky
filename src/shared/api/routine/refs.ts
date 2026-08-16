import { userCollection, userDoc } from "@/shared/api/_common/refs";

/**
 * 루틴 컬렉션 레퍼런스를 반환합니다.
 */
export const routinesRef = (userId: string) =>
  userCollection(userId, "routines");

/**
 * 루틴 문서 레퍼런스를 반환합니다.
 */
export const routineRef = (userId: string, routineId: string) =>
  userDoc(userId, "routines", routineId);



import { userCollection, userDoc } from "@/shared/api/_common/refs";

export const monthlyStatsDocRef = (userId: string, month: string) =>
  userDoc(userId, "monthlyStats", month);

/**
 * 월간 집계 컬렉션. 문서 ID 가 곧 `YYYY-MM` 이라 어떤 달이 있는지 알 수 있다.
 */
export const monthlyStatsCollectionRef = (userId: string) =>
  userCollection(userId, "monthlyStats");

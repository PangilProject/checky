import { userDoc } from "@/shared/api/_common/refs";

export const monthlyStatsDocRef = (userId: string, month: string) =>
  userDoc(userId, "monthlyStats", month);

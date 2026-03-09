/**
 * @file monthlyStats/refs.ts
 * @description API 모듈
 */

import { userDoc } from "@/shared/api/_common/refs";

export const monthlyStatsDocRef = (userId: string, month: string) =>
  userDoc(userId, "monthlyStats", month);

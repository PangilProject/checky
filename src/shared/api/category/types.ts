/**
 * @file category/types.ts
 * @description API 모듈
 */

import type { Timestamp } from "firebase/firestore/lite";

export type CategoryStatus = "ACTIVE" | "ENDED";

export interface Category {
  id: string;
  name: string;
  color: string;
  status: CategoryStatus;
  orderIndex: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  endedAt: Timestamp | null;
}

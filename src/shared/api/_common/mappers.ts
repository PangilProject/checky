/**
 * @file _common/mappers.ts
 * @description API 모듈
 */

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore/lite";

export const mapDoc = <T extends { id: string }>(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): T =>
  ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<T, "id">),
  }) as T;

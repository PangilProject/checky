/**
 * @file routine/crud.ts
 * @description API 모듈
 */

import {
  addDoc,
  deleteField,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore/lite";
import { routineRef, routinesRef } from "./refs";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Routine, RoutineScheduleHistoryItem } from "./types";

/**
 * @description 카테고리별 루틴을 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getRoutinesByCategory = async ({
  userId,
  categoryId,
}: {
  userId: string;
  categoryId: string;
}): Promise<Routine[]> => {
  const q = query(
    routinesRef(userId),
    where("categoryId", "==", categoryId),
    orderBy("orderIndex", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => mapDoc<Routine>(doc));
};

/**
 * @description 루틴을 생성합니다.
 * @param params 요청 파라미터
 * @returns 생성 결과
 */
export const createRoutine = async ({
  userId,
  title,
  categoryId,
  days,
  startDate,
  endDate,
}: {
  userId: string;
  title: string;
  categoryId: string;
  days: number[];
  startDate: string;
  endDate?: string;
}) => {
  const routinesCollection = routinesRef(userId);

  const snap = await getDocs(
    query(routinesCollection, where("categoryId", "==", categoryId))
  );

  await addDoc(routinesCollection, {
    title,
    categoryId,
    days,
    scheduleHistory: [{ effectiveFrom: startDate, days }],
    startDate,
    ...(endDate !== undefined && endDate !== "" && { endDate }),
    orderIndex: snap.size,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
  });
};

/**
 * @description 루틴 정보를 수정합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const updateRoutine = async ({
  userId,
  routineId,
  title,
  days,
  scheduleHistory,
  endDate,
}: {
  userId: string;
  routineId: string;
  title: string;
  days: number[];
  scheduleHistory: RoutineScheduleHistoryItem[];
  endDate?: string | null;
}) => {
  await updateDoc(routineRef(userId, routineId), {
    title,
    days,
    scheduleHistory,
    ...(endDate === undefined
      ? {}
      : endDate
        ? { endDate }
        : { endDate: deleteField() }),
    updatedAt: serverTimestamp(),
  });
};

/**
 * @description 루틴을 삭제합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const deleteRoutine = async ({
  userId,
  routineId,
}: {
  userId: string;
  routineId: string;
}) => {
  await deleteDoc(routineRef(userId, routineId));
};

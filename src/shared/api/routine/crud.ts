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
 * 한 분류에 속한 루틴을 순서대로 읽는다.
 *
 * routines(categoryId, orderIndex) 복합 인덱스가 필요하다.
 * 결과가 없으면 빈 배열이며 예외를 던지지 않는다.
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
 * 루틴을 만든다.
 *
 * 같은 분류의 루틴 개수를 먼저 읽어 목록 맨 뒤 순서를 정한다.
 * 시작 시점의 반복 요일을 scheduleHistory 첫 항목으로 함께 남긴다.
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
 * 루틴을 고친다.
 *
 * 반복 요일이 바뀌면 scheduleHistory 에 이력을 더해, 지난 기록이 예전 요일 기준으로 남게 한다.
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
 * 루틴 문서를 지운다.
 *
 * 수행 기록(routineLogs)은 함께 지우지 않는다. 남은 기록은 루틴이 없으므로 화면에 나타나지 않는다.
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

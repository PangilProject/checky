import {
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { routineRef, routinesRef } from "./refs";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Routine } from "./types";

// 루틴 불러오기
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
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => mapDoc<Routine>(doc));
};

export const createRoutine = async ({
  userId,
  title,
  categoryId,
  days,
  startDate,
}: {
  userId: string;
  title: string;
  categoryId: string;
  days: number[];
  startDate: string;
}) => {
  const routinesCollection = routinesRef(userId);

  const snap = await getDocs(
    query(routinesCollection, where("categoryId", "==", categoryId))
  );

  await addDoc(routinesCollection, {
    title,
    categoryId,
    days,
    startDate,
    orderIndex: snap.size,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
  });
};

// 루틴 수정
export const updateRoutine = async ({
  userId,
  routineId,
  title,
  days,
  startDate,
}: {
  userId: string;
  routineId: string;
  title: string;
  days: number[];
  startDate: string;
}) => {
  await updateDoc(routineRef(userId, routineId), {
    title,
    days,
    startDate, // ✅ 추가
    updatedAt: serverTimestamp(),
  });
};

// 루틴 삭제
export const deleteRoutine = async ({
  userId,
  routineId,
}: {
  userId: string;
  routineId: string;
}) => {
  await deleteDoc(routineRef(userId, routineId));
};

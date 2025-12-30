import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import type { Category } from "./category";

export interface Routine {
  id: string;
  title: string;
  categoryId: string;
  days: number[]; // [0~6] (일~토)
  createdAt?: Date;
}

export interface RoutineCategory {
  category: Category;
  routines: Routine[];
}

// 루틴 불러오기
export const getRoutinesByCategory = async ({
  userId,
  categoryId,
}: {
  userId: string;
  categoryId: string;
}): Promise<Routine[]> => {
  const routinesRef = collection(db, "users", userId, "routines");

  const q = query(
    routinesRef,
    where("categoryId", "==", categoryId),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Routine, "id">),
  }));
};

// 루틴 생성
export const createRoutine = async ({
  userId,
  title,
  categoryId,
  days,
}: {
  userId: string;
  title: string;
  categoryId: string;
  days: number[];
}) => {
  const routinesRef = collection(db, "users", userId, "routines");

  await addDoc(routinesRef, {
    title,
    categoryId,
    days,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
  });
};

// 실시간 업데이트
export const subscribeRoutinesByCategory = ({
  userId,
  categoryId,
  onChange,
}: {
  userId: string;
  categoryId: string;
  onChange: (routines: Routine[]) => void;
}) => {
  const routinesRef = collection(db, "users", userId, "routines");

  const q = query(
    routinesRef,
    where("categoryId", "==", categoryId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Routine, "id">),
    }));

    onChange(routines);
  });
};

// 루틴 수정

export const updateRoutine = async ({
  userId,
  routineId,
  title,
  days,
}: {
  userId: string;
  routineId: string;
  title: string;
  days: number[];
}) => {
  const routineRef = doc(db, "users", userId, "routines", routineId);

  await updateDoc(routineRef, {
    title,
    days,
    updatedAt: serverTimestamp(),
  });
};

// RoutineReport.types.ts

export interface RoutineReportWeek {
  startDate: string; // "2026-01-05"
  endDate: string; // "2026-01-11"
  days: {
    date: string; // "2026-01-05"
    day: number; // 1 (월)
    label: string; // "월"
  }[];
}

export interface RoutineReportRow {
  routineId: string;
  routineTitle: string;

  category: {
    id: string;
    name: string;
    color: string; // ✅ UI 핵심
  };

  startDate: string; // 루틴 시작일
  repeatDays: number[]; // [1, 4] (월, 목)

  checks: Record<string, boolean>; // date -> done
}

export interface RoutineReport {
  week: RoutineReportWeek;
  rows: RoutineReportRow[];
}

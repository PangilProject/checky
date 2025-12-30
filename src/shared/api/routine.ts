import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
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

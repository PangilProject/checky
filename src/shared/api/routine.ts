import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
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

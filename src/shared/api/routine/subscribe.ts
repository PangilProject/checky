import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { routinesRef } from "./refs";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Routine } from "./types";

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
  const q = query(
    routinesRef(userId),
    where("categoryId", "==", categoryId),
    orderBy("orderIndex", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map((doc) => mapDoc<Routine>(doc));

    onChange(routines);
  });
};

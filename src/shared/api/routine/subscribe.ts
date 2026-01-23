import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { routinesRef } from "./refs";
import { mapRoutine } from "./mappers";
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
    const routines = snapshot.docs.map(mapRoutine);

    onChange(routines);
  });
};

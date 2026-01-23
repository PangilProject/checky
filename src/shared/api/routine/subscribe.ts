/**
 * @file routine/subscribe.ts
 * @description API 모듈
 */

import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { routinesRef } from "./refs";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Routine } from "./types";

/**
 * @description 카테고리별 루틴을 실시간 구독합니다.
 * @param params 요청 파라미터
 * @returns 구독 해제 함수
 */
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

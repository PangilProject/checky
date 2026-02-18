/**
 * @file routineLog/subscribe.ts
 * @description API 모듈
 */

import { query, where } from "firebase/firestore/lite";
import { subscribeWithSafariFallback } from "@/shared/api/_common/subscribeWithSafariFallback";
import { mapDoc } from "@/shared/api/_common/mappers";
import { routineLogsRef } from "./refs";
import type { RoutineLog } from "./types";
import { baselineSubscribe } from "@/shared/utils/perfBaseline";

/**
 * @description 주간 루틴 로그를 실시간 구독합니다.
 * @param params 요청 파라미터
 * @returns 구독 해제 함수
 */
export const getRoutineLogsByWeek = ({
  userId,
  startDate,
  endDate,
  onChange,
}: {
  userId: string;
  startDate: string;
  endDate: string;
  onChange: (logs: RoutineLog[], hasChanges: boolean) => void;
}) => {
  const perf = baselineSubscribe("routineLogs/subscribe/byWeek", {
    userId,
    startDate,
    endDate,
  });
  let lastSignature: string | null = null;

  const q = query(
    routineLogsRef(userId),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );

  const unsubscribe = subscribeWithSafariFallback(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => mapDoc<RoutineLog>(doc));
    perf.onSnapshot(logs.length);

    const signature = snapshot.docs
      .map((doc) => {
        const data = doc.data() as RoutineLog;
        return `${doc.id}_${data.routineId}_${data.date}_${data.done}`;
      })
      .sort()
      .join("|");

    if (lastSignature === null) {
      lastSignature = signature;
      return;
    }

    if (signature === lastSignature) {
      return;
    }

    lastSignature = signature;
    onChange(logs, true);
  });

  return () => {
    perf.onUnsubscribe();
    unsubscribe();
  };
};

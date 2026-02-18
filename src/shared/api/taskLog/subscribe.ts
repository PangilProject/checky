/**
 * @file taskLog/subscribe.ts
 * @description API 모듈
 */

import { query, where } from "firebase/firestore/lite";
import { subscribeWithSafariFallback } from "@/shared/api/_common/subscribeWithSafariFallback";
import { taskLogsRef } from "./refs";
import type { TaskLog } from "./types";
import { mapDoc } from "@/shared/api/_common/mappers";
import { baselineSubscribe } from "@/shared/utils/perfBaseline";

/**
 * @description 날짜별 태스크 로그를 실시간 구독합니다.
 * @param params 요청 파라미터
 * @returns 구독 해제 함수
 */
export const getTaskLogsByDate = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: string;
  onChange: (logs: TaskLog[]) => void;
}) => {
  const perf = baselineSubscribe("taskLogs/subscribe/byDate", {
    userId,
    date,
  });
  const q = query(taskLogsRef(userId), where("date", "==", date));

  const unsubscribe = subscribeWithSafariFallback(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => mapDoc<TaskLog>(doc));
    perf.onSnapshot(logs.length);
    onChange(logs);
  });

  return () => {
    perf.onUnsubscribe();
    unsubscribe();
  };
};

/**
 * @description 월간 태스크 로그를 실시간 구독합니다.
 * @param params 요청 파라미터
 * @returns 구독 해제 함수
 */
export const getTaskLogsByMonth = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: Date;
  onChange: (logs: TaskLog[]) => void;
}) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const perf = baselineSubscribe("taskLogs/subscribe/byMonth", {
    userId,
    month: monthKey,
  });

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;

  const q = query(
    taskLogsRef(userId),
    where("date", ">=", start),
    where("date", "<=", end)
  );

  const unsubscribe = subscribeWithSafariFallback(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => mapDoc<TaskLog>(doc));

    perf.onSnapshot(logs.length);
    onChange(logs);
  });

  return () => {
    perf.onUnsubscribe();
    unsubscribe();
  };
};

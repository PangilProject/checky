/**
 * @file task/subscribe.ts
 * @description API 모듈
 */

import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { tasksRef } from "./refs";
import { mapDoc } from "@/shared/api/_common/mappers";
import type { Task } from "./types";
import { baselineSubscribe } from "@/shared/utils/perfBaseline";

/**
 * @description 날짜별 태스크를 실시간 구독합니다.
 * @param params 요청 파라미터
 * @returns 구독 해제 함수
 */
export const getTasksByDate = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: string;
  onChange: (tasks: Task[]) => void;
}) => {
  const perf = baselineSubscribe("tasks/subscribe/byDate", { userId, date });
  const q = query(
    tasksRef(userId),
    where("date", "==", date),
    orderBy("orderIndex", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => mapDoc<Task>(doc));

    perf.onSnapshot(tasks.length);
    onChange(tasks);
  });

  return () => {
    perf.onUnsubscribe();
    unsubscribe();
  };
};

/**
 * @description 월간 태스크를 실시간 구독합니다.
 * @param params 요청 파라미터
 * @returns 구독 해제 함수
 */
export const getTasksByMonth = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: Date;
  onChange: (tasks: Task[]) => void;
}) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const perf = baselineSubscribe("tasks/subscribe/byMonth", {
    userId,
    month: monthKey,
  });

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;

  const q = query(
    tasksRef(userId),
    where("date", ">=", start),
    where("date", "<=", end),
    orderBy("date", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => mapDoc<Task>(doc));

    perf.onSnapshot(tasks.length);
    onChange(tasks);
  });

  return () => {
    perf.onUnsubscribe();
    unsubscribe();
  };
};

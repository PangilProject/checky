import { getDocs, query, where } from "firebase/firestore/lite";
import { tasksRef } from "./refs";
import type { Task } from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { mapTaskDoc } from "./mappers";

/**
 * 하루치 할 일을 읽는다. 홈 화면이 오늘 목록을 그릴 때 쓴다.
 */
export const getTasksByDateOnce = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<Task[]> => {
  const perf = baselineFetch("tasks/fetch/byDate", { userId, date });
  const q = query(tasksRef(userId), where("date", "==", date));
  const snap = await getDocs(q);
  const tasks = snap.docs.map(mapTaskDoc);
  perf.end({ count: tasks.length });
  return tasks;
};

/**
 * 그달의 할 일을 읽는다. 달력과 월간 집계를 다시 셀 때 쓴다.
 */
export const getTasksByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<Task[]> => {
  const perf = baselineFetch("tasks/fetch/byMonth", { userId, month });

  const start = `${month}-01`;
  const end = `${month}-31`;
  const q = query(
    tasksRef(userId),
    where("date", ">=", start),
    where("date", "<=", end),
  );

  const snap = await getDocs(q);
  const tasks = snap.docs.map(mapTaskDoc);
  perf.end({ count: tasks.length });
  return tasks;
};

/**
 * 기간의 할 일을 읽는다. 기록 화면이 한 주·한 달을 돌아볼 때 쓴다.
 *
 * date 한 필드의 범위 조건이라 복합 인덱스가 필요 없다. 읽기는 기간 안의 할 일 수만큼이다.
 */
export const getTasksByRangeOnce = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<Task[]> => {
  const perf = baselineFetch("tasks/fetch/byRange", {
    userId,
    startDate,
    endDate,
  });
  const q = query(
    tasksRef(userId),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );

  const snap = await getDocs(q);
  const tasks = snap.docs.map(mapTaskDoc);
  perf.end({ count: tasks.length });
  return tasks;
};

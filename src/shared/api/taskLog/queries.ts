import { getDocs, query, where } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import { taskLogsRef } from "./refs";
import type { TaskLog } from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";

/**
 * 하루치 완료 기록을 읽는다. 할 일 목록에 체크 표시를 그릴 때 쓴다.
 */
export const getTaskLogsByDateOnce = async ({
  userId,
  date,
}: {
  userId: string;
  date: string;
}): Promise<TaskLog[]> => {
  const perf = baselineFetch("taskLogs/fetch/byDate", { userId, date });
  const q = query(taskLogsRef(userId), where("date", "==", date));
  const snap = await getDocs(q);
  const logs = snap.docs.map((doc) => mapDoc<TaskLog>(doc));
  perf.end({ count: logs.length });
  return logs;
};

/**
 * 그달의 완료 기록을 읽는다.
 */
export const getTaskLogsByMonthOnce = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}): Promise<TaskLog[]> => {
  const perf = baselineFetch("taskLogs/fetch/byMonth", { userId, month });

  const start = `${month}-01`;
  const end = `${month}-31`;
  const q = query(
    taskLogsRef(userId),
    where("date", ">=", start),
    where("date", "<=", end),
  );

  const snap = await getDocs(q);
  const logs = snap.docs.map((doc) => mapDoc<TaskLog>(doc));
  perf.end({ count: logs.length });
  return logs;
};

/**
 * 기간의 완료 기록을 읽는다. 기록 화면이 쓴다.
 *
 * date 한 필드의 범위 조건이라 복합 인덱스가 필요 없다.
 */
export const getTaskLogsByRangeOnce = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<TaskLog[]> => {
  const perf = baselineFetch("taskLogs/fetch/byRange", {
    userId,
    startDate,
    endDate,
  });
  const q = query(
    taskLogsRef(userId),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );

  const snap = await getDocs(q);
  const logs = snap.docs.map((doc) => mapDoc<TaskLog>(doc));
  perf.end({ count: logs.length });
  return logs;
};

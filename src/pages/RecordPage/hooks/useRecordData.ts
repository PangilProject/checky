import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
import {
  routineKeys,
  routineLogKeys,
  taskKeys,
  taskLogKeys,
} from "@/shared/api/keys";
import { getTasksByMonthOnce } from "@/shared/api/task";
import { getTaskLogsByMonthOnce } from "@/shared/api/taskLog";
import { getRoutineLogsByMonthOnce, getRoutinesOnce } from "@/shared/api/routine";
import { buildMonthKeysBetween } from "@/shared/api/monthlyStats/monthKeys";
import { summarizeRecord } from "../utils/summarizeRecord";

/**
 * 기록 화면이 한 기간을 돌아보는 데 필요한 원본을 읽어 센다.
 *
 * 원본은 **달 단위 캐시**로 읽고, 기간은 그 안에서 잘라 쓴다. 키와 조회 함수가 달력 fallback
 * (useMonthlyData)과 같아 캐시를 함께 쓰고, 주간·월간을 오가도 같은 달은 다시 읽지 않는다.
 * 한 달을 처음 열면 그달 할 일·할 일 기록·루틴 기록 수에 루틴 수를 더한 만큼 읽는다.
 *
 * 신선도는 전역 기본값을 따른다. 대신 바뀌는 쪽이 이 캐시를 맞춘다.
 *  - 루틴 기록: 체크 토글이 월별 캐시를 낙관 반영한다 (비용 이슈 14)
 *  - 할 일·할 일 기록: 바꾸는 경로가 markTaskMonthsStale 로 그달을 낡음 표시한다 (비용 이슈 16)
 *  - 루틴 목록: 루틴을 고치면 refreshCalendarConsistency 가 routineKeys.all 을 무효화한다
 */
export const useRecordData = ({
  startDate,
  endDate,
  cutoffDate,
}: {
  startDate: string;
  endDate: string;
  cutoffDate: string;
}) => {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const lastCounted = cutoffDate < endDate ? cutoffDate : endDate;
  // 아직 시작하지 않은 기간은 셀 것이 없으므로 읽지 않는다
  const months = useMemo(
    () => buildMonthKeysBetween(startDate, lastCounted),
    [startDate, lastCounted],
  );
  const enabled = Boolean(userId) && months.length > 0;

  const categoriesQuery = useCategoriesQuery(userId, { enabled: Boolean(userId) });

  const tasksQueries = useQueries({
    queries: months.map((month) => ({
      queryKey: taskKeys.byMonth(userId, month),
      queryFn: () => getTasksByMonthOnce({ userId, month }),
      enabled,
    })),
  });
  const taskLogsQueries = useQueries({
    queries: months.map((month) => ({
      queryKey: taskLogKeys.byMonth(userId, month),
      queryFn: () => getTaskLogsByMonthOnce({ userId, month }),
      enabled,
    })),
  });
  const routineLogsQueries = useQueries({
    queries: months.map((month) => ({
      queryKey: routineLogKeys.byMonth(userId, month),
      queryFn: () => getRoutineLogsByMonthOnce({ userId, month }),
      enabled,
    })),
  });
  const routinesQuery = useQuery({
    queryKey: routineKeys.list(userId),
    queryFn: () => getRoutinesOnce(userId),
    enabled,
  });

  const monthQueries = [...tasksQueries, ...taskLogsQueries, ...routineLogsQueries];
  const allQueries = [categoriesQuery, routinesQuery, ...monthQueries];
  const isLoading = allQueries.some((query) => query.isLoading);
  const isError = allQueries.some((query) => query.isError);

  const tasks = tasksQueries.flatMap((query) => query.data ?? []);
  const taskLogs = taskLogsQueries.flatMap((query) => query.data ?? []);
  const routineLogs = routineLogsQueries.flatMap((query) => query.data ?? []);

  // 루틴 수 × 날짜 수만큼 도는 가벼운 계산이라 렌더마다 센다.
  // useQueries 결과는 렌더마다 새 배열이라 useMemo 로 묶어도 걸러지지 않는다.
  const summary = summarizeRecord({
    tasks,
    taskLogs,
    routines: routinesQuery.data ?? [],
    routineLogs,
    categories: categoriesQuery.data ?? [],
    startDate,
    endDate,
    cutoffDate,
  });

  const refetch = () => {
    allQueries.forEach((query) => void query.refetch());
  };

  return { summary, isLoading, isError, refetch };
};

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { getTasksByMonthOnce } from "@/shared/api/task";
import { getTaskLogsByMonthOnce } from "@/shared/api/taskLog";
import {
  getRoutineLogsByMonthOnce,
  getRoutinesByMonthOnce,
} from "@/shared/api/routine";
import {
  getMonthlyStatsByMonthOnce,
  upsertMonthlyStatsByMonth,
} from "@/shared/api/monthlyStats";
import {
  monthlyStatsKeys,
  routineKeys,
  routineLogKeys,
  taskKeys,
  taskLogKeys,
} from "@/shared/api/keys";
import { buildLegacyMonthlyActivityCountMap } from "./legacyMonthlyActivity";
import { convertToMonthlyStatsDays } from "./convertToMonthlyStatsDays";
import type {
  MonthlyRoutine,
  MonthlyRoutineLog,
  MonthlyTask,
  MonthlyTaskLog,
} from "../types";

/**
 * 월별 루틴/할일 활동 데이터를 조회하고 관리하는 커스텀 훅
 *
 * 데이터 흐름:
 * 1. monthlyStats(집계 데이터)를 우선 조회
 * 2. monthlyStats가 없는 경우에만 legacy 원천 데이터(tasks, routines 등)로 fallback 계산
 * 3. fallback 결과를 monthlyStats에 upsert하여 이후부터는 집계 데이터를 사용
 *
 * @param date 기준 날짜 (해당 월 데이터를 조회)
 */
export const useMonthlyData = (date: Date) => {
  const { user } = useAuth();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const monthKey = `${year}-${month}`;
  const userId = user?.uid ?? "";

  // 1) 정식 monthlyStats 문서를 우선 조회합니다.
  const monthlyStatsQuery = useQuery({
    queryKey: monthlyStatsKeys.byMonth(userId, monthKey),
    queryFn: () => getMonthlyStatsByMonthOnce({ userId, month: monthKey }),
    enabled: Boolean(user?.uid),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });
  const shouldUseLegacyFallback =
    Boolean(user?.uid) &&
    monthlyStatsQuery.status === "success" &&
    !monthlyStatsQuery.data;

  // 같은 monthKey에 대해 fallback upsert 중복 실행을 방지합니다.
  const writtenMonthRef = useRef<string | null>(null);

  // 2) monthlyStats가 비어 있을 때만 fallback 원천 데이터 쿼리를 활성화합니다.
  const tasksQuery = useQuery<MonthlyTask[]>({
    queryKey: taskKeys.byMonth(userId, monthKey),
    queryFn: () => getTasksByMonthOnce({ userId, month: monthKey }),
    enabled: shouldUseLegacyFallback,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const taskLogsQuery = useQuery<MonthlyTaskLog[]>({
    queryKey: taskLogKeys.byMonth(userId, monthKey),
    queryFn: () => getTaskLogsByMonthOnce({ userId, month: monthKey }),
    enabled: shouldUseLegacyFallback,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const routinesQuery = useQuery<MonthlyRoutine[]>({
    queryKey: routineKeys.byMonth(userId, monthKey),
    queryFn: () => getRoutinesByMonthOnce({ userId, month: monthKey }),
    enabled: shouldUseLegacyFallback,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const routineLogsQuery = useQuery<MonthlyRoutineLog[]>({
    queryKey: routineLogKeys.byMonth(userId, monthKey),
    queryFn: () => getRoutineLogsByMonthOnce({ userId, month: monthKey }),
    enabled: shouldUseLegacyFallback,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    // monthlyStats가 없는 경우에만 원천 데이터로 fallback 집계를 수행합니다.
    if (!shouldUseLegacyFallback) return;
    if (!userId) return;
    if (writtenMonthRef.current === monthKey) return;
    if (
      tasksQuery.status !== "success" ||
      taskLogsQuery.status !== "success" ||
      routinesQuery.status !== "success" ||
      routineLogsQuery.status !== "success"
    ) {
      return;
    }

    const fallbackMap = buildLegacyMonthlyActivityCountMap({
      date,
      tasks: tasksQuery.data ?? [],
      taskLogs: taskLogsQuery.data ?? [],
      routines: routinesQuery.data ?? [],
      routineLogs: routineLogsQuery.data ?? [],
    });

    const days = convertToMonthlyStatsDays({ monthKey, map: fallbackMap });

    // 1회 upsert 후 캐시에 monthlyStats가 생기면 다음 렌더부터 정식 경로를 사용합니다.
    writtenMonthRef.current = monthKey;
    void upsertMonthlyStatsByMonth({ userId, month: monthKey, days }).catch(
      (error) => {
        writtenMonthRef.current = null;
        console.error("Failed to upsert monthlyStats", error);
      },
    );
  }, [
    date,
    monthKey,
    routineLogsQuery.data,
    routineLogsQuery.status,
    routinesQuery.data,
    routinesQuery.status,
    shouldUseLegacyFallback,
    taskLogsQuery.data,
    taskLogsQuery.status,
    tasksQuery.data,
    tasksQuery.status,
    userId,
  ]);

  return {
    monthKey,
    // 화면에서는 monthlyStats 기반 집계를 우선 사용합니다.
    monthlyStatsDays: monthlyStatsQuery.data?.days ?? null,
    // fallback 계산/디버깅을 위해 원천 데이터도 함께 반환합니다.
    tasks: tasksQuery.data ?? [],
    taskLogs: taskLogsQuery.data ?? [],
    routines: routinesQuery.data ?? [],
    routineLogs: routineLogsQuery.data ?? [],
    isLoading:
      monthlyStatsQuery.isLoading ||
      (shouldUseLegacyFallback &&
        (tasksQuery.isLoading ||
          taskLogsQuery.isLoading ||
          routinesQuery.isLoading ||
          routineLogsQuery.isLoading)),
    refresh: async () => {
      // monthlyStats 우선 재조회 후 없으면 fallback 원천 쿼리를 강제 갱신합니다.
      const monthlyStatsResult = await monthlyStatsQuery.refetch();
      if (monthlyStatsResult.data) {
        return;
      }

      await Promise.all([
        tasksQuery.refetch(),
        taskLogsQuery.refetch(),
        routinesQuery.refetch(),
        routineLogsQuery.refetch(),
      ]);
    },
  };
};

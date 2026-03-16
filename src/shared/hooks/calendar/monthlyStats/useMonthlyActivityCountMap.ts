import { useMemo } from "react";
import type { MonthlyActivitySummary } from "@/shared/api/monthlyStats";
import { buildLegacyMonthlyActivityCountMap } from "./legacyMonthlyActivity";
import type {
  MonthlyActivityCount,
  MonthlyRoutine,
  MonthlyRoutineLog,
  MonthlyTask,
  MonthlyTaskLog,
} from "../types";

/**
 * 월간 활동 집계 맵(총합/완료/남은 개수)을 반환하는 훅입니다.
 * - monthlyStats 문서가 있으면 해당 값을 우선 사용합니다.
 * - monthlyStats 문서가 없으면 레거시 계산기로 동일 스키마를 구성합니다.
 */
export const useMonthlyActivityCountMap = ({
  date,
  monthKey,
  monthlyStatsDays,
  tasks,
  taskLogs,
  routines,
  routineLogs,
}: {
  date: Date;
  monthKey: string;
  monthlyStatsDays: Record<string, MonthlyActivitySummary> | null;
  tasks: MonthlyTask[];
  taskLogs: MonthlyTaskLog[];
  routines: MonthlyRoutine[];
  routineLogs: MonthlyRoutineLog[];
}) => {
  const map = useMemo(() => {
    // 1. 정식 monthlyStats가 있으면 이를 최우선으로 사용합니다.
    if (monthlyStatsDays) {
      return new Map<string, MonthlyActivityCount>(
        Object.entries(monthlyStatsDays)
          // 활동이 있는 날짜(또는 total > 0)만 맵에 포함합니다.
          .filter(([, summary]) => {
            if (summary.hasActivity === true) return true;
            return (summary.total ?? 0) > 0;
          })
          // monthlyStats days(DD)를 YYYY-MM-DD 키로 변환합니다.
          .map(([day, summary]) => [
            `${monthKey}-${day.padStart(2, "0")}`,
            {
              total: summary.total ?? 0,
              completed: summary.completed ?? 0,
              remaining: summary.remaining ?? 0,
            },
          ]),
      );
    }

    // 2. monthlyStats가 없는 구간은 레거시 계산기로 동일 결과를 보장합니다.
    return buildLegacyMonthlyActivityCountMap({
      date,
      tasks,
      taskLogs,
      routines,
      routineLogs,
    });
  }, [
    date,
    monthKey,
    monthlyStatsDays,
    tasks,
    taskLogs,
    routines,
    routineLogs,
  ]);

  return map;
};

import type { QueryClient } from "@tanstack/react-query";
import {
  monthlyStatsKeys,
  routineLogKeys,
  routineReportKeys,
} from "@/shared/api/keys";
import type { RoutineReport, RoutineReportRow } from "@/shared/api/routine";
import { toggleRoutineLog } from "@/shared/api/routineLog";
import {
  patchMonthlyStatsCompletionByDay,
  type MonthlyStats,
} from "@/shared/api/monthlyStats";

interface UseRoutineToggleParams {
  userId?: string;
  queryClient: QueryClient;
  week: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 루틴 체크 토글 시 낙관적 캐시 업데이트와 서버 반영을 처리합니다.
 */
export function useRoutineToggle({
  userId,
  queryClient,
  week,
}: UseRoutineToggleParams) {
  const routineReportKey = routineReportKeys.byWeek(
    userId ?? "",
    week.startDate,
    week.endDate
  );

  return async (routineId: string, date: string, current: boolean) => {
    if (!userId) return;

    const monthKey = date.slice(0, 7);
    const dayKey = date.slice(8, 10);
    const done = !current;
    const completedDelta = done ? 1 : -1;

    // 루틴 주간 리포트 체크 상태를 먼저 갱신합니다.
    queryClient.setQueryData<RoutineReport>(routineReportKey, (prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        rows: prev.rows.map((row: RoutineReportRow) =>
          row.routineId !== routineId
            ? row
            : {
                ...row,
                checks: {
                  ...row.checks,
                  [date]: done,
                },
              }
        ),
      };
    });

    // 월별 루틴 로그 캐시를 동기화합니다.
    queryClient.setQueryData(
      routineLogKeys.byMonth(userId, monthKey),
      (prev: { routineId: string; date: string; done: boolean }[] | undefined) => {
        if (!prev) return prev;

        const index = prev.findIndex(
          (log) => log.routineId === routineId && log.date === date
        );

        if (index === -1) {
          if (!done) return prev;
          return [...prev, { routineId, date, done }];
        }

        const next = [...prev];
        next[index] = { ...next[index], done };
        return next;
      }
    );

    // 월간 통계 캐시의 완료/남은 개수를 동기화합니다.
    queryClient.setQueryData<MonthlyStats | null>(
      monthlyStatsKeys.byMonth(userId, monthKey),
      (prev) => {
        if (!prev) return prev;

        const currentDay = prev.days?.[dayKey];
        if (!currentDay) return prev;

        const completed = Math.max(
          (currentDay.completed ?? 0) + completedDelta,
          0
        );
        const total = Math.max(currentDay.total ?? 0, 0);
        const remaining = Math.max(total - completed, 0);

        return {
          ...prev,
          days: {
            ...prev.days,
            [dayKey]: {
              ...currentDay,
              completed,
              remaining,
              hasActivity: total > 0,
            },
          },
        };
      }
    );

    // 실제 서버 데이터도 반영합니다.
    await toggleRoutineLog({ userId, routineId, date, done });
    await patchMonthlyStatsCompletionByDay({
      userId,
      month: monthKey,
      day: dayKey,
      completedDelta,
    });
  };
}

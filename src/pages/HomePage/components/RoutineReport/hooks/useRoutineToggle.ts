import type { QueryClient } from "@tanstack/react-query";
import { routineLogKeys, routineReportKeys } from "@/shared/api/keys";
import type { RoutineReport, RoutineReportRow } from "@/shared/api/routine";
import { toggleRoutineLog } from "@/shared/api/routineLog";
import { useCompletionToggle } from "@/shared/hooks/useCompletionToggle";

type RoutineLogCacheEntry = { routineId: string; date: string; done: boolean };

interface UseRoutineToggleParams {
  userId?: string;
  queryClient: QueryClient;
  week: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 루틴 체크 토글.
 *
 * 연타 방지·낙관 갱신·집계 반영·실패 롤백은 useCompletionToggle 이 맡는다.
 * 여기서는 루틴만 쓰는 캐시 두 벌(주간 리포트, 월별 루틴 로그)을 고치고 되돌리는 법만 정한다.
 */
export function useRoutineToggle({
  userId,
  queryClient,
  week,
}: UseRoutineToggleParams) {
  const routineReportKey = routineReportKeys.byWeek(
    userId ?? "",
    week.startDate,
    week.endDate,
  );

  const run = useCompletionToggle({
    kind: "routine",
    failMessage: "루틴 완료 상태를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  });

  return async (routineId: string, date: string, current: boolean) => {
    if (!userId) return;

    const done = !current;
    const routineLogKey = routineLogKeys.byMonth(userId, date.slice(0, 7));

    await run({
      userId,
      guardKey: `${routineId}_${date}`,
      date,
      completedDelta: done ? 1 : -1,
      applyOptimistic: () => {
        const prevReport =
          queryClient.getQueryData<RoutineReport>(routineReportKey);
        const prevLogs =
          queryClient.getQueryData<RoutineLogCacheEntry[]>(routineLogKey);

        // 주간 리포트의 체크 상태
        queryClient.setQueryData<RoutineReport>(routineReportKey, (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            rows: prev.rows.map((row: RoutineReportRow) =>
              row.routineId !== routineId
                ? row
                : { ...row, checks: { ...row.checks, [date]: done } },
            ),
          };
        });

        // 월별 루틴 로그 캐시
        queryClient.setQueryData<RoutineLogCacheEntry[]>(
          routineLogKey,
          (prev) => {
            if (!prev) return prev;

            const index = prev.findIndex(
              (log) => log.routineId === routineId && log.date === date,
            );
            if (index === -1) {
              if (!done) return prev;
              return [...prev, { routineId, date, done }];
            }

            const next = [...prev];
            next[index] = { ...next[index], done };
            return next;
          },
        );

        return () => {
          queryClient.setQueryData(routineReportKey, prevReport);
          queryClient.setQueryData(routineLogKey, prevLogs);
        };
      },
      commit: () => toggleRoutineLog({ userId, routineId, date, done }),
    });
  };
}

import type { QueryClient } from "@tanstack/react-query";
import { routineLogKeys, routineReportKeys } from "@/shared/api/keys";
import type { RoutineReport, RoutineReportRow } from "@/shared/api/routine";
import { toggleRoutineLog, type RoutineLog } from "@/shared/api/routineLog";
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
 * 여기서는 루틴만 쓰는 캐시(주간 리포트, 월별 루틴 로그, 루틴 기록 창)를 고치고 되돌리는 법만 정한다.
 *
 * 기록 화면은 월별 루틴 로그 캐시를 그대로 쓰므로 따로 고칠 것이 없다.
 * 무효화로 처리하면 체크할 때마다 다음 방문에 한 달치를 통째로 다시 읽는다(비용 이슈 14).
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

        // 루틴 기록 창 캐시. 키 끝의 두 날짜가 그 캐시가 담은 범위라, 범위 안일 때만 고친다.
        const prevHistories = queryClient.getQueriesData<RoutineLog[]>({
          queryKey: routineLogKeys.routineOf(userId, routineId),
        });
        prevHistories.forEach(([key, logs]) => {
          const [startDate, endDate] = key.slice(-2);
          if (!logs || typeof startDate !== "string" || typeof endDate !== "string") return;
          if (date < startDate || date > endDate) return;

          const index = logs.findIndex((log) => log.date === date);
          if (index === -1) {
            if (!done) return;
            queryClient.setQueryData<RoutineLog[]>(key, [
              ...logs,
              { id: `${routineId}_${date}`, routineId, date, done },
            ]);
            return;
          }
          const next = [...logs];
          next[index] = { ...next[index], done };
          queryClient.setQueryData<RoutineLog[]>(key, next);
        });

        return () => {
          queryClient.setQueryData(routineReportKey, prevReport);
          queryClient.setQueryData(routineLogKey, prevLogs);
          prevHistories.forEach(([key, logs]) => queryClient.setQueryData(key, logs));
        };
      },
      commit: () => toggleRoutineLog({ userId, routineId, date, done }),
    });
  };
}

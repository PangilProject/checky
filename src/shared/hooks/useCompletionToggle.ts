import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { monthlyStatsKeys } from "@/shared/api/keys";
import {
  collectAffectedMonths,
  patchMonthlyStatsCompletionByDay,
  patchMonthlyStatsDayCache,
  recalculateMonthlyStatsByMonth,
  type MonthlyStats,
} from "@/shared/api/monthlyStats";

/**
 * "체크 하나를 켜고 끄는" 흐름을 한곳에서 다룬다.
 *
 * 할 일과 루틴은 체크하는 대상만 다를 뿐, 그 뒤에 일어나는 일이 똑같다.
 *  1. 같은 칸의 연타를 막는다 — 호출부가 넘기는 현재 값은 렌더 시점 값이라,
 *     다시 그려지기 전에 또 누르면 같은 기준으로 판단해 증감이 같은 방향으로 두 번 나간다.
 *  2. 화면(캐시)을 먼저 고치고 서버에 쓴다.
 *  3. 월간 집계 문서에 완료 증감을 반영한다.
 *  4. 그날 칸이 없다고 하면(missing-day) 그 달을 다시 센다 — 지나치면 이 완료가
 *     달력에서 영영 빠진다.
 *  5. 실패하면 캐시를 되돌리고, 집계는 원본에서 다시 세운 뒤 알린다.
 *
 * 예전에는 이 흐름이 useTaskList 와 useRoutineToggle 에 한 벌씩 있었다.
 * 달라지는 것은 kind 와 "어떤 도메인 캐시를 함께 고치는가"뿐이라, 그 둘만 밖에서 받는다.
 */

interface UseCompletionToggleParams {
  /** 어느 몫의 완료인가. 집계 문서의 task/routine 몫을 가른다 */
  kind: "task" | "routine";
  /** 저장에 실패했을 때 보여 줄 문구 */
  failMessage: string;
}

interface RunParams {
  userId: string;
  /** 연타를 막을 칸의 식별자. 같은 칸이 처리 중이면 무시한다 */
  guardKey: string;
  /** 체크한 날짜 (YYYY-MM-DD) */
  date: string;
  /** 완료가 늘면 +1, 풀리면 -1 */
  completedDelta: 1 | -1;
  /**
   * 도메인 캐시를 낙관적으로 고친다.
   * 되돌리는 함수를 돌려주면 실패했을 때 이 훅이 불러 준다.
   */
  applyOptimistic: () => () => void;
  /** 서버에 실제 체크를 쓴다 */
  commit: () => Promise<void>;
}

export const useCompletionToggle = ({
  kind,
  failMessage,
}: UseCompletionToggleParams) => {
  const queryClient = useQueryClient();
  // 처리가 진행 중인 칸. 같은 칸의 연타를 막는다.
  const runningKeysRef = useRef(new Set<string>());

  return useCallback(
    async ({
      userId,
      guardKey,
      date,
      completedDelta,
      applyOptimistic,
      commit,
    }: RunParams) => {
      if (!userId) return;
      if (runningKeysRef.current.has(guardKey)) return;
      runningKeysRef.current.add(guardKey);

      const month = date.slice(0, 7);
      const day = date.slice(8, 10);
      const monthlyStatsKey = monthlyStatsKeys.byMonth(userId, month);
      const prevMonthly =
        queryClient.getQueryData<MonthlyStats | null>(monthlyStatsKey);

      const revertDomainCaches = applyOptimistic();
      patchMonthlyStatsDayCache(
        queryClient,
        userId,
        month,
        day,
        completedDelta,
      );

      try {
        await commit();

        const patchResult = await patchMonthlyStatsCompletionByDay({
          userId,
          month,
          day,
          completedDelta,
          kind,
        });

        // 문서는 있는데 그날 칸이 없으면 집계가 실제와 어긋난 상태다.
        if (patchResult === "missing-day") {
          await recalculateMonthlyStatsByMonth({ userId, month, scope: kind });
          await queryClient.invalidateQueries({ queryKey: monthlyStatsKey });
        }
      } catch {
        revertDomainCaches();
        queryClient.setQueryData(monthlyStatsKey, prevMonthly);

        const affectedMonths = collectAffectedMonths({ dates: [date] });
        await Promise.all(
          affectedMonths.map((affected) =>
            recalculateMonthlyStatsByMonth({
              userId,
              month: affected,
              scope: kind,
            }),
          ),
        );
        await queryClient.invalidateQueries({ queryKey: monthlyStatsKey });
        toast.error(failMessage);
      } finally {
        runningKeysRef.current.delete(guardKey);
      }
    },
    [failMessage, kind, queryClient],
  );
};

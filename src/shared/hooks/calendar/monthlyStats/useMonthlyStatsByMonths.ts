import { useEffect, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { monthlyStatsKeys } from "@/shared/api/keys";
import {
  MONTHLY_STATS_SPLIT_VERSION,
  getMonthlyStatsByMonthOnce,
  recalculateMonthlyStatsByMonth,
  type MonthlyStats,
} from "@/shared/api/monthlyStats";

/**
 * 다시 세기를 이미 시작한 달. 사용자·달 단위로 한 번만 시도한다.
 *
 * 컴포넌트 안의 ref 로 두면 화면을 오갈 때마다 초기화되어, 실패하지 않은 달도
 * 다시 세는 일이 생긴다. 다시 세기는 원본 네 컬렉션을 한 달치 읽으므로 모듈에 둔다.
 */
const repairStarted = new Set<string>();

const NO_MONTHS: string[] = [];

/**
 * 여러 달의 monthlyStats 를 읽는다. 달성 현황과 월별 기록이 쓴다.
 *
 * 달력(useMonthlyData)과 같은 캐시 키를 쓰므로 이미 읽은 달은 다시 읽지 않고,
 * 체크로 캐시가 바뀌면 여기서도 바로 반영된다.
 *
 * repairMonths 에 넘긴 달은 할 일·루틴 몫이 필요한 달이라 두 경우를 한 번 고친다.
 *  - 몫이 없는 옛 문서(version 1): 다시 세어 version 2 로 올린다.
 *  - 문서가 없는 달: 원본에서 세어 만든다. 단 managedMonth 는 달력이 같은 일을 하므로 건너뛴다.
 *    둘이 동시에 만들면 같은 달을 두 번 읽고 두 번 쓴다.
 * 합산값만 필요한 달(지난 기간 비교 등)은 넘기지 않는다. 다시 세기는 한 달치 원본을 모두 읽는다.
 * 어느 쪽이든 한 번 고친 달은 그 뒤로 추가 비용이 없다.
 */
export const useMonthlyStatsByMonths = ({
  months,
  repairMonths = NO_MONTHS,
  managedMonth,
}: {
  months: string[];
  repairMonths?: string[];
  managedMonth?: string;
}) => {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: months.map((month) => ({
      queryKey: monthlyStatsKeys.byMonth(userId, month),
      queryFn: () => getMonthlyStatsByMonthOnce({ userId, month }),
      enabled: Boolean(userId),
    })),
  });

  const statsByMonth = useMemo(() => {
    const map: Record<string, MonthlyStats | null | undefined> = {};
    months.forEach((month, index) => {
      map[month] = results[index]?.data;
    });
    return map;
  }, [months, results]);

  useEffect(() => {
    if (!userId) return;

    repairMonths.forEach((month) => {
      const stats = statsByMonth[month];
      if (stats === undefined) return;

      const needsRepair = stats
        ? (stats.version ?? 1) < MONTHLY_STATS_SPLIT_VERSION
        : month !== managedMonth;
      if (!needsRepair) return;

      const key = `${userId}:${month}`;
      if (repairStarted.has(key)) return;
      repairStarted.add(key);

      void recalculateMonthlyStatsByMonth({ userId, month })
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: monthlyStatsKeys.byMonth(userId, month),
          }),
        )
        .catch((error) => {
          repairStarted.delete(key);
          console.error("Failed to repair monthlyStats", error);
        });
    });
  }, [userId, managedMonth, repairMonths, statsByMonth, queryClient]);

  return {
    statsByMonth,
    isLoading: results.some((result) => result.isLoading),
  };
};

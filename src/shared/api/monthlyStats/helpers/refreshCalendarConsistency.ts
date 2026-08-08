import type { QueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys, routineKeys, routineReportKeys, taskKeys } from "@/shared/api/keys";
import { recalculateMonthlyStatsByMonth } from "../recalculate";

/**
 * 달력과 리포트가 실제 기록과 어긋나지 않게 맞춘다.
 *
 * recalculate 를 켜면 해당 달들을 원본에서 다시 세고, 그다음 관련 캐시를 무효화한다.
 * 다시 세는 쪽은 비용이 크므로 요약이 실제와 달라졌을 때만 켠다.
 */
export const refreshCalendarConsistency = async ({
  queryClient,
  userId,
  affectedMonths,
  recalculate = false,
  invalidateTasksByMonth = false,
}: {
  queryClient: QueryClient;
  userId: string;
  affectedMonths: string[];
  recalculate?: boolean;
  invalidateTasksByMonth?: boolean;
}) => {
  const months = Array.from(new Set(affectedMonths.filter(Boolean)));

  if (recalculate && months.length > 0) {
    await Promise.all(
      months.map((month) => recalculateMonthlyStatsByMonth({ userId, month })),
    );
  }

  await Promise.all([
    ...months.map((month) =>
      queryClient.invalidateQueries({
        queryKey: monthlyStatsKeys.byMonth(userId, month),
      }),
    ),
    ...(invalidateTasksByMonth
      ? months.map((month) =>
          queryClient.invalidateQueries({
            queryKey: taskKeys.byMonth(userId, month),
          }),
        )
      : []),
    queryClient.invalidateQueries({ queryKey: monthlyStatsKeys.all }),
    queryClient.invalidateQueries({ queryKey: routineKeys.all }),
    queryClient.invalidateQueries({ queryKey: routineReportKeys.all }),
  ]);
};

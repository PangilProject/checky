import type { QueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys, routineKeys, routineReportKeys, taskKeys } from "@/shared/api/keys";
import { rebuildMonthlyStatsByMonth } from "../rebuild";

export const refreshCalendarConsistency = async ({
  queryClient,
  userId,
  affectedMonths,
  rebuild = false,
  invalidateTasksByMonth = false,
}: {
  queryClient: QueryClient;
  userId: string;
  affectedMonths: string[];
  rebuild?: boolean;
  invalidateTasksByMonth?: boolean;
}) => {
  const months = Array.from(new Set(affectedMonths.filter(Boolean)));

  if (rebuild && months.length > 0) {
    await Promise.all(
      months.map((month) => rebuildMonthlyStatsByMonth({ userId, month })),
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

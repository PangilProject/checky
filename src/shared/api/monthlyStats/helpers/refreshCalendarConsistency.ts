import type { QueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys, routineKeys, routineReportKeys, taskKeys } from "@/shared/api/keys";
import { recalculateMonthlyStatsByMonth } from "../recalculate";

/**
 * 달력과 리포트가 실제 기록과 어긋나지 않게 맞춘다.
 *
 * recalculate 를 켜면 해당 달들을 원본에서 다시 세고, 그다음 관련 캐시를 무효화한다.
 * 다시 세는 쪽은 비용이 크므로 요약이 실제와 달라졌을 때만 켠다.
 *
 * 무효화는 넘긴 달의 캐시만 좁혀서 한다. 도메인 전체를 무효화하면
 * 마운트된 쿼리가 전부 다시 읽어 와 변경과 무관한 read 가 쌓인다.
 * 루틴이 바뀐 경우에만 invalidateRoutineData 를 켜서
 * 루틴 목록과 주간 리포트 캐시를 함께 갱신한다.
 */
export const refreshCalendarConsistency = async ({
  queryClient,
  userId,
  affectedMonths,
  recalculate = false,
  invalidateTasksByMonth = false,
  invalidateRoutineData = false,
}: {
  queryClient: QueryClient;
  userId: string;
  affectedMonths: string[];
  recalculate?: boolean;
  invalidateTasksByMonth?: boolean;
  invalidateRoutineData?: boolean;
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
    ...(invalidateRoutineData
      ? [
          queryClient.invalidateQueries({ queryKey: routineKeys.all }),
          queryClient.invalidateQueries({ queryKey: routineReportKeys.all }),
        ]
      : []),
  ]);
};

import type { QueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys } from "@/shared/api/keys";
import type { MonthlyStats } from "./types";

/**
 * 완료 개수가 바뀐 것을 월간 집계 캐시에 먼저 반영한다.
 *
 * 체크 표시는 눌렀을 때 바로 바뀌어야 하는데, 달력의 숫자는 별도 문서에서 온다.
 * 서버 응답을 기다렸다 고치면 체크와 숫자가 잠깐 어긋나 보이므로 캐시를 먼저 고친다.
 *
 * 값을 0 아래나 total 위로 넘기지 않는 것이 이 함수의 책임이다. 할 일과 루틴이
 * 각자 이 계산을 들고 있던 시절에는 한쪽만 고치면 달력 숫자가 음수로 새는 길이 있었다.
 *
 * 몫 필드(taskCompleted 등)가 있는 칸이면 해당 몫도 함께 고친다. 합산만 고치면
 * 달성 현황의 할 일·루틴 숫자가 서버 값을 다시 읽을 때까지 체크를 따라오지 못한다.
 *
 * @param completedDelta 완료가 늘면 +1, 풀리면 -1
 * @param kind 어느 몫의 완료가 바뀌었는지
 */
export const patchMonthlyStatsDayCache = (
  queryClient: QueryClient,
  userId: string,
  month: string,
  day: string,
  completedDelta: number,
  kind: "task" | "routine",
) => {
  queryClient.setQueryData<MonthlyStats | null>(
    monthlyStatsKeys.byMonth(userId, month),
    (prev) => {
      if (!prev) return prev;

      const currentDay = prev.days?.[day];
      // 그날 칸이 아직 없으면 완료만 담아 둔다. total 은 이 경로에서 알 수 없다
      // (서버 patch 가 missing-day 를 돌려주면 호출부가 그 달을 다시 센다).
      if (!currentDay) {
        return {
          ...prev,
          days: {
            ...prev.days,
            [day]: {
              total: 0,
              completed: Math.max(completedDelta, 0),
              remaining: 0,
              hasActivity: false,
            },
          },
        };
      }

      const completed = Math.max((currentDay.completed ?? 0) + completedDelta, 0);
      const total = Math.max(currentDay.total ?? 0, 0);
      const remaining = Math.max(total - completed, 0);

      const kindTotal = currentDay[`${kind}Total`];
      const kindPatch =
        kindTotal === undefined
          ? {}
          : {
              [`${kind}Completed`]: Math.min(
                Math.max((currentDay[`${kind}Completed`] ?? 0) + completedDelta, 0),
                Math.max(kindTotal, 0),
              ),
            };

      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...currentDay,
            completed,
            remaining,
            hasActivity: total > 0,
            ...kindPatch,
          },
        },
      };
    },
  );
};

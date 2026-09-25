import type { DayCount } from "../countMonth";
import type { MonthlyActivitySummary } from "../types";

/**
 * 날짜별 Map 을 monthlyStats 문서에 넣을 형태로 바꾼다.
 *
 * 문서가 이미 월 단위로 나뉘어 있어 키에 연·월을 되풀이할 필요가 없으므로,
 * `2026-08-15` 대신 `15` 를 키로 쓴다.
 * 다른 달 날짜가 섞여 들어오면 걸러 낸다.
 */
export const convertToMonthlyStatsDays = ({
  monthKey,
  map,
}: {
  monthKey: string;
  map: Map<string, DayCount>;
}) => {
  const days: Record<string, MonthlyActivitySummary> = {};

  map.forEach((value, dateKey) => {
    if (!dateKey.startsWith(`${monthKey}-`)) return;
    const day = dateKey.slice(8, 10);
    days[day] = {
      total: value.total,
      completed: value.completed,
      remaining: value.remaining,
      hasActivity: value.total > 0,
      taskTotal: value.taskTotal,
      taskCompleted: value.taskCompleted,
      routineTotal: value.routineTotal,
      routineCompleted: value.routineCompleted,
    };
  });
  return days;
};

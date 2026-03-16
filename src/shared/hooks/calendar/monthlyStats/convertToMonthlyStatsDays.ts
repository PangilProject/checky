import type { MonthlyActivitySummary } from "@/shared/api/monthlyStats";
import type { MonthlyActivityCount } from "../types";

/**
 * Map<YYYY-MM-DD, Activity> → monthlyStats days 구조로 변환
 *
 * - 날짜 키를 "DD" 형식으로 변환
 * - UI에서 사용 가능한 형태로 데이터 구조 변경
 *
 * 예:
 * "2026-03-05" → "05"
 */
export const convertToMonthlyStatsDays = ({
  monthKey,
  map,
}: {
  monthKey: string;
  map: Map<string, MonthlyActivityCount>;
}) => {
  const days: Record<string, MonthlyActivitySummary> = {};

  map.forEach((value, dateKey) => {
    // 현재 월 데이터만 필터링
    if (!dateKey.startsWith(`${monthKey}-`)) return;

    const day = dateKey.slice(8, 10);

    days[day] = {
      total: value.total,
      completed: value.completed,
      remaining: value.remaining,
      hasActivity: value.total > 0, // UI 표시용 flag
    };
  });

  return days;
};

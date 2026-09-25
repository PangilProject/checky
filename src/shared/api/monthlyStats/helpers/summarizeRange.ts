import { formatDateToYmd, parseYmd } from "@/shared/utils/formatDate";
import type { MonthlyStats } from "../types";

/** 기간 안의 하루. 오늘 이후 날짜는 upcoming 이며 합계에 들어가지 않는다. */
export interface RangeSummaryDay {
  date: string;
  total: number;
  completed: number;
  upcoming: boolean;
}

export interface RangeSummary {
  /** 시작일 ~ 기준일에 해야 했던 것 */
  total: number;
  /** 그중 체크한 것 */
  completed: number;
  taskTotal: number;
  taskCompleted: number;
  routineTotal: number;
  routineCompleted: number;
  /** 기준일 다음 날 ~ 끝에 예정된 것 */
  upcoming: number;
  /**
   * 합계에 들어간 모든 날에 할 일·루틴 몫이 있었는지.
   * 몫이 없는 옛 문서(version 1)가 섞이면 false 이고, 이때 몫 합계는 믿으면 안 된다.
   */
  hasSplit: boolean;
  days: RangeSummaryDay[];
}

/**
 * 여러 달의 monthlyStats 에서 한 기간의 개수를 모은다.
 *
 * 세는 규칙은 monthlyStats 와 같다. 그날 해야 했던 것이 전체, 그중 체크한 것이 완료다.
 * 기준일(cutoffDate) 이후는 아직 오지 않은 날이라 전체에 넣지 않고 upcoming 으로 따로 센다.
 * 넣으면 주 중반의 달성률이 늘 낮게 나온다.
 *
 * 한 주가 두 달에 걸칠 수 있어 문서를 달별로 받는다. 문서가 없는 달은 그 기간에 활동이 없다고 본다.
 * 날짜는 모두 `YYYY-MM-DD` 이며, 잘못된 날짜가 오면 빈 결과를 돌려준다.
 */
export const summarizeRange = ({
  statsByMonth,
  startDate,
  endDate,
  cutoffDate,
}: {
  statsByMonth: Record<string, MonthlyStats | null | undefined>;
  startDate: string;
  endDate: string;
  cutoffDate: string;
}): RangeSummary => {
  const summary: RangeSummary = {
    total: 0,
    completed: 0,
    taskTotal: 0,
    taskCompleted: 0,
    routineTotal: 0,
    routineCompleted: 0,
    upcoming: 0,
    hasSplit: true,
    days: [],
  };

  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  if (!start || !end) return summary;

  for (const cursor = start; cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = formatDateToYmd(cursor);
    const day = statsByMonth[date.slice(0, 7)]?.days?.[date.slice(8, 10)];
    const total = Math.max(day?.total ?? 0, 0);
    const completed = Math.min(Math.max(day?.completed ?? 0, 0), total);
    const upcoming = date > cutoffDate;

    summary.days.push({ date, total, completed: upcoming ? 0 : completed, upcoming });

    if (upcoming) {
      summary.upcoming += total;
      continue;
    }

    summary.total += total;
    summary.completed += completed;

    if (!day || total === 0) continue;
    if (day.taskTotal === undefined || day.routineTotal === undefined) {
      summary.hasSplit = false;
      continue;
    }
    summary.taskTotal += day.taskTotal;
    summary.taskCompleted += day.taskCompleted ?? 0;
    summary.routineTotal += day.routineTotal;
    summary.routineCompleted += day.routineCompleted ?? 0;
  }

  return summary;
};

/** 완료 ÷ 전체를 반올림한 백분율. 전체가 0 이면 null 이다(0% 와 "셀 것이 없음"을 가른다). */
export const toPercent = (completed: number, total: number) =>
  total > 0 ? Math.round((completed / total) * 100) : null;

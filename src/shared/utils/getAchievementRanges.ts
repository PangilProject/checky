import { buildMonthKeysBetween } from "@/shared/api/monthlyStats/monthKeys";
import { formatDateToYmd } from "@/shared/utils/formatDate";

export type AchievementMode = "week" | "month";

/** 세는 기간. cutoffDate 까지가 합계, 그 뒤는 예정이다. */
export interface AchievementPeriod {
  startDate: string;
  endDate: string;
  cutoffDate: string;
}

export interface AchievementRanges {
  /** 기간이 오늘보다 앞인지, 오늘을 품는지, 아직 오지 않았는지 */
  status: "past" | "current" | "future";
  period: AchievementPeriod;
  /** 지난 기간의 같은 시점. 아직 시작 전인 기간에는 비교할 것이 없어 null 이다 */
  compare: AchievementPeriod | null;
  /** 두 기간을 세는 데 필요한 monthlyStats 달 목록 */
  months: string[];
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** 두 로컬 자정 사이의 날 수. 서머타임이 없는 곳이라도 반올림으로 시각 오차를 흡수한다. */
const daysBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / DAY_MS);

/**
 * 선택 날짜가 속한 주(일~토) 또는 달과, 비교할 지난 기간을 정한다.
 *
 * 비교는 지난 기간 전체가 아니라 **같은 시점까지**만 한다. 수요일에 지난주 일~토 전체와
 * 비교하면 이번 주가 늘 불리하기 때문이다. 지난달이 더 짧으면 그 달 마지막 날에서 멈춘다.
 */
export const getAchievementRanges = ({
  selectedDate,
  mode,
  today,
}: {
  selectedDate: Date;
  mode: AchievementMode;
  today: Date;
}): AchievementRanges => {
  const base = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );

  const start =
    mode === "week"
      ? addDays(base, -base.getDay())
      : new Date(base.getFullYear(), base.getMonth(), 1);
  const end =
    mode === "week"
      ? addDays(start, 6)
      : new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const prevStart =
    mode === "week"
      ? addDays(start, -7)
      : new Date(base.getFullYear(), base.getMonth() - 1, 1);
  const prevEnd =
    mode === "week" ? addDays(end, -7) : addDays(start, -1);

  const startDate = formatDateToYmd(start);
  const endDate = formatDateToYmd(end);
  const todayYmd = formatDateToYmd(today);

  const status =
    todayYmd < startDate ? "future" : todayYmd > endDate ? "past" : "current";
  const cutoff =
    status === "future"
      ? addDays(start, -1)
      : status === "past"
        ? end
        : new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let compare: AchievementPeriod | null = null;
  if (status !== "future") {
    const lastOffset = daysBetween(prevStart, prevEnd);
    const offset = Math.min(daysBetween(start, cutoff), lastOffset);
    compare = {
      startDate: formatDateToYmd(prevStart),
      endDate: formatDateToYmd(prevEnd),
      cutoffDate: formatDateToYmd(addDays(prevStart, offset)),
    };
  }

  return {
    status,
    period: { startDate, endDate, cutoffDate: formatDateToYmd(cutoff) },
    compare,
    months: buildMonthKeysBetween(formatDateToYmd(prevStart), endDate),
  };
};

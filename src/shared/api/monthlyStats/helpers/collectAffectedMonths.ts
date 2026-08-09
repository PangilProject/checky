import { buildMonthKeysBetween } from "../monthKeys";

const monthKeyOf = (date: string) => date.slice(0, 7);

/**
 * 바뀐 날짜들이 걸쳐 있는 달을 모은다.
 *
 * 할 일을 다른 달로 옮기거나 여러 달에 걸친 루틴을 고치면 여러 달의 요약이 함께 틀어진다.
 * 어떤 달을 다시 세어야 하는지 여기서 정한다. 순수 계산이며 Firestore 를 읽지 않는다.
 */
export const collectAffectedMonths = ({
  dates = [],
  ranges = [],
}: {
  dates?: string[];
  ranges?: Array<{ startDate: string; endDate: string }>;
}) => {
  const months = new Set<string>();

  dates
    .filter((date) => Boolean(date))
    .forEach((date) => {
      if (date.length >= 7) months.add(monthKeyOf(date));
    });

  ranges.forEach(({ startDate, endDate }) => {
    buildMonthKeysBetween(startDate, endDate).forEach((month) => {
      months.add(month);
    });
  });

  return [...months];
};

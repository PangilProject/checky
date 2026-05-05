import { buildMonthKeysBetween } from "../rebuild";

const monthKeyOf = (date: string) => date.slice(0, 7);

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

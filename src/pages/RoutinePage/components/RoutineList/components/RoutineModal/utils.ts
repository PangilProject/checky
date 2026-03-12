import type { Routine, RoutineScheduleHistoryItem } from "@/shared/api/routine";

export const hasSameDays = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((value, index) => value === sb[index]);
};

export const getTodayLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

export const buildNextScheduleHistory = ({
  routine,
  effectiveFrom,
  days,
  shouldAppend,
}: {
  routine: Routine;
  effectiveFrom: string;
  days: number[];
  shouldAppend: boolean;
}): RoutineScheduleHistoryItem[] => {
  const baseHistory =
    routine.scheduleHistory && routine.scheduleHistory.length > 0
      ? routine.scheduleHistory
      : [{ effectiveFrom: routine.startDate, days: routine.days }];

  if (!shouldAppend) {
    return [...baseHistory].sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );
  }

  const next = [...baseHistory];
  const index = next.findIndex((item) => item.effectiveFrom === effectiveFrom);

  if (index >= 0) {
    next[index] = { effectiveFrom, days };
  } else {
    next.push({ effectiveFrom, days });
  }

  return next.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
};

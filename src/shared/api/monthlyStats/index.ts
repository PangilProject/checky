export type { MonthlyStats, MonthlyActivitySummary } from "./types";

export {
  getMonthlyStatsByMonthOnce,
  getMonthlyStatsMonthsOnce,
  upsertMonthlyStatsByMonth,
  replaceMonthlyStatsByMonth,
  patchMonthlyStatsCompletionByDay,
  patchMonthlyStatsByDayDeltas,
} from "./queries";

export { recalculateMonthlyStatsByMonth } from "./recalculate";
export { buildMonthlyActivityCountMap } from "./countMonth";
export type {
  MonthlyTask,
  MonthlyTaskLog,
  MonthlyRoutine,
  MonthlyRoutineLog,
  DayCount,
} from "./countMonth";
export { buildMonthKeysBetween } from "./monthKeys";
export { collectAffectedMonths } from "./helpers/collectAffectedMonths";
export { patchMonthlyStatsDayCache } from "./cache";
export { refreshCalendarConsistency } from "./helpers/refreshCalendarConsistency";

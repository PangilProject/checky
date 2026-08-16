export type { MonthlyStats, MonthlyActivitySummary } from "./types";

export {
  getMonthlyStatsByMonthOnce,
  getMonthlyStatsMonthsOnce,
  upsertMonthlyStatsByMonth,
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
export { collectAffectedMonths } from "./helpers/collectAffectedMonths";
export { patchMonthlyStatsDayCache } from "./cache";
export { refreshCalendarConsistency } from "./helpers/refreshCalendarConsistency";

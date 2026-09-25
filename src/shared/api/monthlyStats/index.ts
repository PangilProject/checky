export type { MonthlyStats, MonthlyActivitySummary } from "./types";
export { MONTHLY_STATS_SPLIT_VERSION } from "./types";

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
export { convertToMonthlyStatsDays } from "./helpers/convertToMonthlyStatsDays";
export { summarizeRange, toPercent } from "./helpers/summarizeRange";
export type { RangeSummary, RangeSummaryDay } from "./helpers/summarizeRange";
export { patchMonthlyStatsDayCache } from "./cache";
export { refreshCalendarConsistency } from "./helpers/refreshCalendarConsistency";

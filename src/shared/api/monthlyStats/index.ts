/**
 * @file monthlyStats/index.ts
 * @description API 모듈
 */

export type { MonthlyStats, MonthlyActivitySummary } from "./types";

export {
  getMonthlyStatsByMonthOnce,
  upsertMonthlyStatsByMonth,
  replaceMonthlyStatsByMonth,
  patchMonthlyStatsCompletionByDay,
  patchMonthlyStatsByDayDeltas,
} from "./queries";

export { rebuildMonthlyStatsByMonth, buildMonthKeysBetween } from "./rebuild";
export { collectAffectedMonths } from "./helpers/collectAffectedMonths";
export { refreshCalendarConsistency } from "./helpers/refreshCalendarConsistency";

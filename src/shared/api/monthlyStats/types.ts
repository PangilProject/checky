/**
 * @file monthlyStats/types.ts
 * @description API 모듈
 */

export type MonthlyActivitySummary = {
  total: number;
  completed: number;
  remaining: number;
  hasActivity?: boolean;
};

export type MonthlyStats = {
  month: string;
  days: Record<string, MonthlyActivitySummary>;
  version?: number;
};

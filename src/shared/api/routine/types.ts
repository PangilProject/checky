/**
 * @file routine/types.ts
 * @description API 모듈
 */

import type { Category } from "@/shared/api/category";

export interface RoutineScheduleHistoryItem {
  effectiveFrom: string;
  days: number[];
}

export interface Routine {
  id: string;
  title: string;
  categoryId: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
  orderIndex: number;
  startDate: string;
  endDate?: string;
  createdAt?: Date;
  updatedAt?: Date | { toDate: () => Date };
}

export interface RoutineCategory {
  category: Category;
  routines: Routine[];
}

export interface RoutineReportWeek {
  startDate: string;
  endDate: string;
  days: {
    date: string;
    day: number;
    label: string;
  }[];
}

export interface RoutineReportRow {
  routineId: string;
  routineTitle: string;

  category: {
    id: string;
    name: string;
    color: string;
  };

  startDate: string;
  repeatDays: number[];

  checks: Record<string, boolean>;
}

export interface RoutineReport {
  week: RoutineReportWeek;
  rows: RoutineReportRow[];
}

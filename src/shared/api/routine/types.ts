import type { Category } from "@/shared/api/category";

export interface Routine {
  id: string;
  title: string;
  categoryId: string;
  days: number[];
  orderIndex: number;
  startDate: string;
  createdAt?: Date;
}

export interface RoutineCategory {
  category: Category;
  routines: Routine[];
}

export interface RoutineReportWeek {
  startDate: string; // "2026-01-05"
  endDate: string; // "2026-01-11"
  days: {
    date: string; // "2026-01-05"
    day: number; // 1 (월)
    label: string; // "월"
  }[];
}

export interface RoutineReportRow {
  routineId: string;
  routineTitle: string;

  category: {
    id: string;
    name: string;
    color: string; // ✅ UI 핵심
  };

  startDate: string; // 루틴 시작일
  repeatDays: number[]; // [1, 4] (월, 목)

  checks: Record<string, boolean>; // date -> done
}

export interface RoutineReport {
  week: RoutineReportWeek;
  rows: RoutineReportRow[];
}

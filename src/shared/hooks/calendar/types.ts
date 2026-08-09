import type { RoutineScheduleHistoryItem } from "@/shared/api/routine";

export type MonthlyTask = { id: string; date: string };
export type MonthlyTaskLog = { taskId: string; date: string; completed: boolean };
export type MonthlyRoutine = {
  id: string;
  startDate: string;
  endDate?: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
  /** 마지막 수정일(YYYY-MM-DD). 레거시 루틴 게이트용 — RoutineMonthly 참고 */
  updatedAt?: string | null;
};
export type MonthlyRoutineLog = { routineId: string; date: string; done: boolean };

export interface MonthlyActivityCount {
  total: number;
  completed: number;
  remaining: number;
}

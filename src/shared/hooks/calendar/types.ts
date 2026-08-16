/**
 * 달력이 다루는 월간 데이터의 타입.
 *
 * 원천 데이터 타입(Monthly*)은 집계기가 소유한다. 여기서 따로 선언하면
 * 집계기가 보는 모양과 화면이 보는 모양이 갈릴 수 있어 그대로 다시 내보낸다.
 */
export type {
  MonthlyTask,
  MonthlyTaskLog,
  MonthlyRoutine,
  MonthlyRoutineLog,
} from "@/shared/api/monthlyStats/countMonth";

/** 화면이 읽는 하루치 개수. 집계기의 DayCount 중 합산값만 쓴다. */
export interface MonthlyActivityCount {
  total: number;
  completed: number;
  remaining: number;
}

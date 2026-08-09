import type { Category } from "@/shared/api/category";

/** 반복 요일을 바꾼 이력 한 건. effectiveFrom 부터 days 가 적용된다. */
export interface RoutineScheduleHistoryItem {
  effectiveFrom: string;
  days: number[];
}

/**
 * 정해진 요일마다 되풀이하는 습관.
 *
 * 반복 요일을 바꿔도 지난 기록이 틀어지지 않도록 바꾼 이력을 scheduleHistory 에 쌓는다.
 * endDate 가 없으면 끝나지 않고 계속 이어진다.
 */
export interface Routine {
  id: string;
  title: string;
  categoryId: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
  orderIndex: number;
  startDate: string;
  endDate?: string;
  // 읽기는 mapDoc 을 거치므로 Date 다. 저장 시에는 serverTimestamp() 를 쓴다.
  createdAt?: Date;
  updatedAt?: Date;
}

/** 한 분류와 그 분류에 속한 루틴들. 루틴 화면이 분류별로 묶어 보여줄 때 쓴다. */
export interface RoutineCategory {
  category: Category;
  routines: Routine[];
}

/** 리포트가 다루는 한 주. 시작·끝 날짜와 요일 일곱 칸을 담는다. */
export interface RoutineReportWeek {
  startDate: string;
  endDate: string;
  days: {
    date: string;
    day: number;
    label: string;
  }[];
}

/** 리포트의 루틴 한 줄. checks 는 날짜별 수행 여부다. */
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

/** 주간 리포트 전체. 한 주 정보와 루틴별 줄 목록으로 이루어진다. */
export interface RoutineReport {
  week: RoutineReportWeek;
  rows: RoutineReportRow[];
}

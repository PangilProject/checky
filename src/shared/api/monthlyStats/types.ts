/**
 * 하루치 요약. 그날 할 일과 루틴을 합쳐 전체·완료·남은 개수를 센다.
 *
 * taskTotal 등 몫 필드는 합산값을 task/routine 별로 나눈 것이다(version 2 문서부터).
 * 루틴만 바뀌었을 때 할 일까지 다시 세지 않고 루틴 몫만 갈아 끼우기 위해 둔다.
 * version 1 문서에는 없으며, 그 경우 전체 재계산으로만 고칠 수 있다.
 */
export type MonthlyActivitySummary = {
  total: number;
  completed: number;
  remaining: number;
  hasActivity?: boolean;
  taskTotal?: number;
  taskCompleted?: number;
  routineTotal?: number;
  routineCompleted?: number;
};

/**
 * 한 달치 요약을 담는 문서.
 *
 * 달력과 리포트가 날짜별 기록을 일일이 읽지 않도록 미리 세어 둔 값이다.
 * days 의 키는 `YYYY-MM-DD` 다.
 *
 * version 1 은 합산값만, version 2 는 모든 날짜에 task/routine 몫이 나뉘어 있다.
 * version 2 는 전체 재계산이 실행될 때만 부여한다(별도 백필 없음).
 */
export type MonthlyStats = {
  month: string;
  days: Record<string, MonthlyActivitySummary>;
  version?: number;
};

/** 몫이 나뉜 문서 세대. 이 버전 이상이어야 스코프 재계산이 가능하다. */
export const MONTHLY_STATS_SPLIT_VERSION = 2;

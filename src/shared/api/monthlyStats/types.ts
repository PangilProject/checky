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
 * days 의 키는 그 달 안의 날짜 두 자리(`05`)다. 문서가 이미 월 단위라 연·월은 붙이지 않는다.
 *
 * version 1 은 합산값만, version 2 는 모든 날짜에 task/routine 몫이 나뉘어 있다.
 * version 2 는 원본에서 한 달을 통째로 센 결과로만 부여한다.
 * 전체 재계산과, 달력이 문서 없는 달을 처음 만들 때(fallback)가 그 경우다. 별도 백필은 없다.
 */
export type MonthlyStats = {
  month: string;
  days: Record<string, MonthlyActivitySummary>;
  version?: number;
};

/** 몫이 나뉜 문서 세대. 이 버전 이상이어야 스코프 재계산이 가능하다. */
export const MONTHLY_STATS_SPLIT_VERSION = 2;

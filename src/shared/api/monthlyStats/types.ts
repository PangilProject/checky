/** 하루치 요약. 그날 할 일과 루틴을 합쳐 전체·완료·남은 개수를 센다. */
export type MonthlyActivitySummary = {
  total: number;
  completed: number;
  remaining: number;
  hasActivity?: boolean;
};

/**
 * 한 달치 요약을 담는 문서.
 *
 * 달력과 리포트가 날짜별 기록을 일일이 읽지 않도록 미리 세어 둔 값이다.
 * days 의 키는 `YYYY-MM-DD` 다.
 */
export type MonthlyStats = {
  month: string;
  days: Record<string, MonthlyActivitySummary>;
  version?: number;
};

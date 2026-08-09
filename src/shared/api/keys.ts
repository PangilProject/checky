/**
 * React Query 캐시 키를 한곳에서 관리한다.
 *
 * 계층 구조(all -> list -> detail)로 나누어 필요한 범위만 무효화할 수 있게 하고,
 * 키를 흩어 두지 않아 무효화 대상이 어긋나는 실수를 막는다.
 */

/**
 * 카테고리 관련 쿼리 키
 * all: 모든 카테고리
 * list: 사용자별 카테고리 목록 (userId)
 *
 * 상태(ACTIVE/ENDED)별 키는 두지 않는다. 상태별 목록은 무필터 정본에서
 * select 로 파생한다(useCategoriesQuery). 키를 나누면 같은 컬렉션이
 * 캐시에 여러 벌 생겨 화면마다 다시 읽게 된다.
 */
export const categoryKeys = {
  all: ["categories"] as const,
  list: (userId: string) => [...categoryKeys.all, userId, "all"] as const,
};

/**
 * 루틴 페이지 복합 데이터 쿼리 키
 * 카테고리 + 카테고리별 루틴을 한 번에 조회하는 쿼리에 사용됩니다.
 * 활성 카테고리를 내부에 포함하므로, 카테고리 변경 시에도 함께 무효화해야 합니다.
 * detail: 사용자별 루틴 페이지 데이터 (userId)
 */
export const routinePageKeys = {
  all: ["routinePageData"] as const,
  detail: (userId: string) => [...routinePageKeys.all, userId] as const,
};

/**
 * 할 일 관련 쿼리 키
 * all: 모든 할 일
 * byDate: 특정 날짜의 할 일 목록 (userId, date)
 * byMonth: 특정 월의 할 일 목록 (userId, month)
 */
export const taskKeys = {
  all: ["tasks"] as const,
  byDate: (userId: string, date: string) =>
    [...taskKeys.all, userId, date] as const,
  byMonth: (userId: string, month: string) =>
    [...taskKeys.all, userId, "month", month] as const,
};

/**
 * 할 일 로그 관련 쿼리 키
 * all: 모든 할 일 로그
 * byDate: 특정 날짜의 할 일 로그 (userId, date)
 * byMonth: 특정 월의 할 일 로그 (userId, month)
 */
export const taskLogKeys = {
  all: ["taskLogs"] as const,
  byDate: (userId: string, date: string) =>
    [...taskLogKeys.all, userId, date] as const,
  byMonth: (userId: string, month: string) =>
    [...taskLogKeys.all, userId, "month", month] as const,
};

/**
 * 루틴 관련 쿼리 키
 * all: 모든 루틴
 * byMonth: 특정 월의 루틴 목록 (userId, month)
 */
export const routineKeys = {
  all: ["routines"] as const,
  byMonth: (userId: string, month: string) =>
    [...routineKeys.all, userId, "month", month] as const,
};

/**
 * 루틴 로그 관련 쿼리 키
 * all: 모든 루틴 로그
 * byMonth: 특정 월의 루틴 로그 (userId, month)
 */
export const routineLogKeys = {
  all: ["routineLogs"] as const,
  byMonth: (userId: string, month: string) =>
    [...routineLogKeys.all, userId, "month", month] as const,
};

/**
 * 루틴 리포트 관련 쿼리 키
 * all: 모든 루틴 리포트
 * byWeek: 특정 주의 루틴 리포트 (userId, startDate, endDate)
 */
export const routineReportKeys = {
  all: ["routineReport"] as const,
  byWeek: (userId: string, startDate: string, endDate: string) =>
    [...routineReportKeys.all, userId, startDate, endDate] as const,
};

/**
 * 월간 통계 관련 쿼리 키
 * all: 모든 월간 통계
 * byMonth: 특정 월의 월간 통계 (userId, month)
 */
export const monthlyStatsKeys = {
  all: ["monthlyStats"] as const,
  byMonth: (userId: string, month: string) =>
    [...monthlyStatsKeys.all, userId, month] as const,
};

/**
 * 공지 관련 쿼리 키
 *
 * 공지는 사용자별 데이터가 아니므로 userId 를 넣지 않는다.
 * 사용자 화면과 관리자 화면이 같은 키를 써서 한쪽에서 바꾸면 다른 쪽도 갱신된다.
 */
export const noticeKeys = {
  all: ["notices"] as const,
};

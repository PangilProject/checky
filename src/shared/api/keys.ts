/**
 * src/shared/api/keys.ts
 * 쿼리 키를 관리하는 파일
 * 이 키들은 React Query의 useQuery, useMutation 및 queryClient의 캐시 관리 메서드(invalidateQueries 등)에서 사용됩니다.
 * 계층 구조(all -> list -> detail)로 분리하여 특정 범위의 캐시를 효율적으로 무효화하고,
 * 중앙 집중식 관리를 통해 키의 일관성을 유지하여 휴먼 에러를 방지하고 유지보수성을 높입니다.
 */

/**
 * 카테고리 관련 쿼리 키
 * all: 모든 카테고리
 * list: 사용자별 카테고리 목록 (userId, status)
 */
export const categoryKeys = {
  all: ["categories"] as const,
  list: (userId: string, status?: string) =>
    [...categoryKeys.all, userId, status ?? "all"] as const,
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

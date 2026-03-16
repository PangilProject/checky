import type {
  MonthlyActivityCount,
  MonthlyRoutine,
  MonthlyRoutineLog,
  MonthlyTask,
  MonthlyTaskLog,
} from "../types";
import type { RoutineScheduleHistoryItem } from "@/shared/api/routine";

/**
 * 레거시 월별 활동 집계 함수
 *
 * - monthlyStats 문서가 존재하지 않을 때 fallback으로 사용됨
 * - tasks, routines, logs 데이터를 기반으로 날짜별 활동 수를 계산
 * - 결과는 Map<YYYY-MM-DD, { total, completed, remaining }> 형태로 반환
 *
 * 주요 처리 흐름:
 * 1. tasks → 날짜별 total 증가
 * 2. routines → 반복 규칙(scheduleHistory)을 기반으로 날짜별 total 계산
 * 3. logs → 실제 완료된 항목만 completed로 반영
 * 4. remaining = total - completed 계산
 */

interface buildLegacyMonthlyActivityCountMapProps {
  date: Date;
  tasks: MonthlyTask[];
  taskLogs: MonthlyTaskLog[];
  routines: MonthlyRoutine[];
  routineLogs: MonthlyRoutineLog[];
}

export const buildLegacyMonthlyActivityCountMap = ({
  date,
  tasks,
  taskLogs,
  routines,
  routineLogs,
}: buildLegacyMonthlyActivityCountMapProps) => {
  // 날짜별 집계 결과 저장 (YYYY-MM-DD 기준)
  const next = new Map<string, MonthlyActivityCount>();

  // 유효한 task / routine 키 (존재하는 항목만 집계하기 위한 검증용)
  const validTaskKeySet = new Set<string>();
  const validRoutineKeySet = new Set<string>();

  /**
   * 날짜 키가 없으면 초기값 생성 후 반환
   */
  const ensure = (dateKey: string) => {
    if (!next.has(dateKey)) {
      next.set(dateKey, { total: 0, completed: 0, remaining: 0 });
    }
    return next.get(dateKey)!;
  };

  /**
   * 특정 날짜 기준으로 적용되는 반복 요일 계산
   *
   * - scheduleHistory를 기반으로 가장 최근 effectiveFrom 규칙을 찾음
   * - 예: "이 날짜에는 어떤 요일 규칙이 적용되는가?"
   */
  const getRepeatDaysByDate = ({
    history,
    date,
  }: {
    history: RoutineScheduleHistoryItem[];
    date: string;
  }) => {
    // 최신 규칙부터 역순 탐색
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i];
      if (item.effectiveFrom <= date) {
        return item.days;
      }
    }
    return [];
  };

  /**
   * 1. Task 집계
   *
   * - 단순히 해당 날짜에 존재하는 task 개수를 total로 추가
   */
  tasks.forEach(({ id, date }) => {
    ensure(date).total += 1;
    validTaskKeySet.add(`${id}_${date}`);
  });

  /**
   * 2. Routine 집계
   *
   * - 반복 요일 + 시작/종료 날짜 조건을 기반으로
   * - 해당 월의 모든 날짜를 순회하며 total 계산
   */
  routines.forEach((routine) => {
    const { id, startDate, endDate } = routine;

    // scheduleHistory가 없으면 기본 days 사용
    const history =
      routine.scheduleHistory && routine.scheduleHistory.length > 0
        ? [...routine.scheduleHistory].sort((a, b) =>
            a.effectiveFrom.localeCompare(b.effectiveFrom),
          )
        : [{ effectiveFrom: startDate, days: routine.days }];

    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // 해당 월의 모든 날짜 순회
    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d,
      ).padStart(2, "0")}`;

      // 시작일 이후 && 종료일 이전 조건 체크
      const isAfterStart = dateStr >= startDate;
      const isBeforeEnd = !endDate || dateStr <= endDate;
      if (!isAfterStart || !isBeforeEnd) continue;

      // 해당 날짜에 적용되는 반복 요일 가져오기
      const repeatDays = getRepeatDaysByDate({ history, date: dateStr });

      // 요일이 포함되면 total 증가
      if (repeatDays.includes(dateObj.getDay())) {
        ensure(dateStr).total += 1;
        validRoutineKeySet.add(`${id}_${dateStr}`);
      }
    }
  });

  /**
   * 3. Task 완료 로그 반영
   *
   * - completed === true 인 경우만 카운트
   * - 실제 존재하는 task만 반영 (validation)
   */
  taskLogs.forEach(({ taskId, date, completed }) => {
    if (!completed) return;
    if (!next.has(date)) return;
    if (!validTaskKeySet.has(`${taskId}_${date}`)) return;

    ensure(date).completed += 1;
  });

  /**
   * 4. Routine 완료 로그 반영
   */
  routineLogs.forEach(({ routineId, date, done }) => {
    if (!done) return;
    if (!next.has(date)) return;
    if (!validRoutineKeySet.has(`${routineId}_${date}`)) return;

    ensure(date).completed += 1;
  });

  /**
   * 5. remaining 계산
   *
   * - 음수 방지 처리 포함
   */
  next.forEach((value) => {
    value.remaining = Math.max(value.total - value.completed, 0);
  });

  return next;
};

import type { RoutineScheduleHistoryItem } from "./types";

/**
 * 루틴 반복 요일 규칙의 유일한 해석기.
 *
 * 반복 요일은 바뀔 수 있고, 바꾸기 전 날짜에는 예전 요일이 그대로 적용돼야 한다.
 * 이 규칙을 세 곳(주간 리포트·월간 재계산·클라이언트 fallback 집계)이 각자
 * 구현하고 있었는데, 한쪽만 고치면 "리포트에는 칸이 없어 체크할 수 없는 날이
 * 달력에는 미완료로 남는" 어긋남이 생긴다. 그래서 여기 한 벌만 둔다.
 */

/** 반복 요일 이력을 시간순으로 정렬한다. 이력이 없으면 시작일부터 현재 요일이 적용된 것으로 본다. */
export const normalizeScheduleHistory = ({
  startDate,
  days,
  scheduleHistory,
}: {
  startDate: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
}): RoutineScheduleHistoryItem[] => {
  if (scheduleHistory && scheduleHistory.length > 0) {
    return [...scheduleHistory].sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom),
    );
  }

  // scheduleHistory 가 생기기 전에 만들어진 루틴은 이력이 없다.
  return [{ effectiveFrom: startDate, days }];
};

/**
 * 그날 적용되던 반복 요일을 찾는다.
 *
 * 이력은 시간순이므로 뒤에서부터 훑어 그날보다 앞선 첫 항목을 쓴다.
 * 시작일보다 앞선 날짜는 해당하는 이력이 없어 빈 배열이 되고, 그러면 아무 날도 세지 않는다.
 */
export const getRepeatDaysByDate = ({
  history,
  date,
}: {
  history: RoutineScheduleHistoryItem[];
  date: string;
}): number[] => {
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i];
    if (item.effectiveFrom <= date) return item.days;
  }

  return [];
};

/** 이력을 명시적으로 쌓기 시작한 뒤에 만들어진 루틴인가. 레거시 게이트 적용 여부를 가른다. */
export const hasExplicitScheduleHistory = (
  scheduleHistory?: RoutineScheduleHistoryItem[],
) => Boolean(scheduleHistory && scheduleHistory.length > 0);

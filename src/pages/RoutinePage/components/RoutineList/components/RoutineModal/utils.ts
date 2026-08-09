import type { Routine, RoutineScheduleHistoryItem } from "@/shared/api/routine";

export const hasSameDays = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((value, index) => value === sb[index]);
};

export const buildNextScheduleHistory = ({
  routine,
  effectiveFrom,
  days,
  shouldAppend,
}: {
  routine: Routine;
  effectiveFrom: string;
  days: number[];
  shouldAppend: boolean;
}): RoutineScheduleHistoryItem[] => {
  const baseHistory =
    routine.scheduleHistory && routine.scheduleHistory.length > 0
      ? routine.scheduleHistory
      : [{ effectiveFrom: routine.startDate, days: routine.days }];

  if (!shouldAppend) {
    return [...baseHistory].sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );
  }

  // 새 변경은 그 날짜부터 계속 적용되는 것이 사용자의 의도다.
  // 그 뒤의 기존 이력을 남겨 두면 그 날짜가 오는 순간 방금 바꾼 요일이
  // 소리 없이 예전 값으로 되돌아가므로, 이후 이력은 잘라내고 덧붙인다.
  const next = baseHistory.filter(
    (item) => item.effectiveFrom < effectiveFrom
  );
  next.push({ effectiveFrom, days });

  return next.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
};

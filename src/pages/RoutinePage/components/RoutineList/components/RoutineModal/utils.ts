import type { Routine, RoutineScheduleHistoryItem } from "@/shared/api/routine";
import type { RoutineModalMode } from "./types";

export const hasSameDays = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((value, index) => value === sb[index]);
};

export const getTodayLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

export interface RoutineFormValues {
  mode: RoutineModalMode;
  title: string;
  selectedDays: number[];
  startDate: string;
  effectiveFrom: string;
  endDateEnabled: boolean;
  endDate: string;
  isRepeatChanged: boolean;
}

/**
 * 루틴 폼의 첫 번째 검증 실패 사유를 반환합니다. 통과하면 null.
 *
 * 실패 사유가 여러 개여도 하나만 안내하기 위해 우선순위 순으로 검사합니다.
 */
export const getRoutineValidationMessage = ({
  mode,
  title,
  selectedDays,
  startDate,
  effectiveFrom,
  endDateEnabled,
  endDate,
  isRepeatChanged,
}: RoutineFormValues): string | null => {
  if (!title.trim()) return "루틴명을 입력해주세요.";
  if (selectedDays.length === 0) return "반복 요일을 하나 이상 선택해주세요.";
  if (mode === "EDIT" && isRepeatChanged && !effectiveFrom) {
    return "변경 적용 날짜를 선택해주세요.";
  }
  if (endDateEnabled && !endDate) return "종료 날짜를 선택해주세요.";
  if (endDateEnabled && endDate < startDate) {
    return "종료 날짜는 시작 날짜보다 빠를 수 없습니다.";
  }

  return null;
};

/**
 * 저장할 변경 사항이 있는지 판단합니다. (CREATE는 항상 true)
 */
export const isRoutineFormDirty = ({
  routine,
  title,
  selectedDays,
  endDateEnabled,
  endDate,
}: {
  routine?: Routine;
  title: string;
  selectedDays: number[];
  endDateEnabled: boolean;
  endDate: string;
}) => {
  // 저장 시 trim된 값이 들어가므로 양쪽 모두 같은 기준으로 비교한다.
  if (!routine) return true;
  if (title.trim() !== routine.title.trim()) return true;
  if (!hasSameDays(selectedDays, routine.days)) return true;

  return (endDateEnabled ? endDate : "") !== (routine.endDate ?? "");
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
      a.effectiveFrom.localeCompare(b.effectiveFrom),
    );
  }

  const next = [...baseHistory];
  const index = next.findIndex((item) => item.effectiveFrom === effectiveFrom);

  if (index >= 0) {
    next[index] = { effectiveFrom, days };
  } else {
    next.push({ effectiveFrom, days });
  }

  return next.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
};

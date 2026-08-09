import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
  type Routine,
} from "@/shared/api/routine";
import { routinePageKeys } from "@/shared/api/keys";
import {
  collectAffectedMonths,
  getMonthlyStatsMonthsOnce,
  refreshCalendarConsistency,
} from "@/shared/api/monthlyStats";
import { getTodayYmd } from "@/shared/hooks/formatDate";
import { buildNextScheduleHistory } from "../utils";
import type { RoutineModalMode } from "../types";

/**
 * 루틴이 걸쳐 있는 기간. endMonth 가 null 이면 끝나지 않는 루틴이다.
 */
type RoutineSpan = { startMonth: string; endMonth: string | null };

/**
 * 루틴 변경으로 다시 세어야 하는 달을 모은다.
 *
 * 두 갈래를 합친다.
 *
 * 1. 루틴 기간이 걸친 달. 끝나지 않는 루틴이면 오늘까지로 본다.
 * 2. **집계 문서가 이미 있는 달 중 루틴 기간과 겹치는 것.**
 *
 * 두 번째가 이 함수의 핵심이다. 달력은 집계 문서가 없는 달만 원본으로 다시 세므로,
 * 틀어질 수 있는 것은 이미 만들어진 문서뿐이다. 끝나지 않는 루틴을 오늘까지만 다시 세면
 * 사용자가 미리 넘겨 본 다음 달의 문서가 낡은 채로 남아, 새 루틴이 영영 보이지 않는다.
 *
 * 몇 달 뒤까지 볼지 추측하는 대신 실제로 있는 달을 읽어 정확히 고른다.
 * 문서가 없는 미래 달은 어차피 원본으로 계산되므로 건드릴 필요가 없다.
 */
const collectMonthsToRecalculate = async ({
  userId,
  span,
}: {
  userId: string;
  span: RoutineSpan;
}) => {
  const today = getTodayYmd();
  const monthStart = `${span.startMonth}-01`;
  // 끝나지 않는 루틴은 오늘까지로 보되, 미래에 시작하는 루틴은
  // 오늘이 시작일보다 앞이라 범위가 뒤집혀 빈 배열이 되므로 시작 달은 보장한다.
  const openEnd = today >= monthStart ? today : monthStart;
  const rangeMonths = collectAffectedMonths({
    ranges: [
      {
        startDate: monthStart,
        endDate: span.endMonth ? `${span.endMonth}-01` : openEnd,
      },
    ],
  });

  // 기간과 겹치는 문서만 서버에서 골라 읽는다. 전체를 읽으면 계정이 오래될수록
  // 루틴 저장 한 번의 read 가 집계 문서 수만큼 늘어난다.
  // 끝나지 않는 루틴은 미리 넘겨 본 미래 달의 문서도 낡을 수 있으므로 상한을 두지 않는다.
  const overlapping = await getMonthlyStatsMonthsOnce(userId, {
    fromMonth: span.startMonth,
    toMonth: span.endMonth ?? "9999-12",
  });

  return Array.from(new Set([...rangeMonths, ...overlapping]));
};

const monthOf = (date: string) => date.slice(0, 7);

const refreshAffectedData = async ({
  userId,
  span,
  queryClient,
}: {
  userId: string;
  span: RoutineSpan;
  queryClient: ReturnType<typeof useQueryClient>;
}) => {
  await refreshCalendarConsistency({
    queryClient,
    userId,
    affectedMonths: await collectMonthsToRecalculate({ userId, span }),
    recalculate: true,
    // 루틴만 바뀌었으므로 루틴 몫만 다시 세고, 할 일 몫은 기존 집계를 쓴다.
    recalculateScope: "routine",
    // 루틴이 바뀌었으므로 루틴 목록과 주간 리포트 캐시도 함께 갱신한다.
    invalidateRoutineData: true,
  });
  await queryClient.invalidateQueries({
    queryKey: routinePageKeys.detail(userId),
  });
};

export const useRoutineModalActions = ({
  routine,
  categoryId,
  onClose,
}: {
  routine?: Routine;
  categoryId: string;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // 저장/삭제 처리 중 중복 실행 방지 (이중 클릭 시 루틴 중복 생성 차단)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async ({
    mode,
    title,
    selectedDays,
    startDate,
    effectiveFrom,
    endDateEnabled,
    endDate,
    isRepeatChanged,
  }: {
    mode: RoutineModalMode;
    title: string;
    selectedDays: number[];
    startDate: string;
    effectiveFrom: string;
    endDateEnabled: boolean;
    endDate: string;
    isRepeatChanged: boolean;
  }) => {
    if (!user) return;
    // 입력값이 잘못된 경우 아무 반응 없이 끝나지 않도록 이유를 알린다
    if (!title.trim()) {
      toast.error("루틴 이름을 입력해 주세요.");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("반복할 요일을 하나 이상 선택해 주세요.");
      return;
    }
    if (mode === "EDIT" && isRepeatChanged && !effectiveFrom) {
      toast.error("변경 적용 시작일을 선택해 주세요.");
      return;
    }
    if (endDateEnabled && !endDate) {
      toast.error("종료 날짜를 선택해 주세요.");
      return;
    }
    if (endDateEnabled && endDate < startDate) {
      toast.error("종료 날짜는 시작 날짜보다 빠를 수 없습니다.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let span: RoutineSpan = {
        startMonth: monthOf(startDate),
        endMonth: null,
      };

      if (mode === "CREATE") {
        await createRoutine({
          userId: user.uid,
          title,
          categoryId,
          days: selectedDays,
          startDate,
          endDate: endDateEnabled ? endDate : undefined,
        });

        span = {
          startMonth: monthOf(startDate),
          endMonth: endDateEnabled && endDate ? monthOf(endDate) : null,
        };
      }

      if (mode === "EDIT" && routine) {
        const prevEnd = routine.endDate ?? null;
        const nextEnd = endDateEnabled && endDate ? endDate : null;
        // 한쪽이라도 끝이 없으면 기간을 열어 둔다.
        // 끝없던 루틴에 종료일을 붙인 경우, 종료일 뒤의 달에도 예전 집계가 남아 있다.
        const spanEnd =
          prevEnd && nextEnd ? (prevEnd > nextEnd ? prevEnd : nextEnd) : null;

        span = {
          startMonth: monthOf(routine.startDate),
          endMonth: spanEnd ? monthOf(spanEnd) : null,
        };

        await updateRoutine({
          userId: user.uid,
          routineId: routine.id,
          title,
          days: selectedDays,
          scheduleHistory: buildNextScheduleHistory({
            routine,
            effectiveFrom,
            days: selectedDays,
            shouldAppend: isRepeatChanged,
          }),
          endDate: endDateEnabled ? endDate : null,
        });
      }

      await refreshAffectedData({ userId: user.uid, span, queryClient });

      onClose();
    } catch {
      toast.error("루틴 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !routine) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const span: RoutineSpan = {
        startMonth: monthOf(routine.startDate),
        endMonth: routine.endDate ? monthOf(routine.endDate) : null,
      };

      await deleteRoutine({
        userId: user.uid,
        routineId: routine.id,
      });

      await refreshAffectedData({ userId: user.uid, span, queryClient });

      onClose();
    } catch {
      toast.error("루틴 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, handleDelete, isSubmitting };
};

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
import {
  monthlyStatsKeys,
  routinePageKeys,
} from "@/shared/api/keys";
import {
  collectAffectedMonths,
  refreshCalendarConsistency,
} from "@/shared/api/monthlyStats";
import { buildNextScheduleHistory, getTodayLocalDate } from "../utils";
import type { RoutineModalMode } from "../types";

const getCachedMonthlyStatsMonths = ({
  queryClient,
  userId,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
  userId: string;
}) => {
  const entries = queryClient.getQueriesData({
    queryKey: monthlyStatsKeys.all,
  });
  const months = new Set<string>();

  entries.forEach(([queryKey]) => {
    if (!Array.isArray(queryKey)) return;
    if (queryKey[0] !== monthlyStatsKeys.all[0]) return;
    if (queryKey[1] !== userId) return;

    const month = queryKey[2];
    if (typeof month === "string" && /^\d{4}-\d{2}$/.test(month)) {
      months.add(month);
    }
  });

  return [...months];
};

const refreshAffectedData = async ({ userId, affectedMonths, queryClient }: { userId: string; affectedMonths: string[]; queryClient: ReturnType<typeof useQueryClient> }) => {
  const months = Array.from(new Set([...affectedMonths, ...getCachedMonthlyStatsMonths({ queryClient, userId })]));
  await refreshCalendarConsistency({
    queryClient,
    userId,
    affectedMonths: months,
    recalculate: true,
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
      let affectedMonths: string[] = [];

      if (mode === "CREATE") {
        await createRoutine({
          userId: user.uid,
          title,
          categoryId,
          days: selectedDays,
          startDate,
          endDate: endDateEnabled ? endDate : undefined,
        });

        const today = getTodayLocalDate();
        const end = endDateEnabled && endDate ? endDate : today;
        affectedMonths = collectAffectedMonths({
          ranges: [{ startDate, endDate: end }],
        });
      }

      if (mode === "EDIT" && routine) {
        const today = getTodayLocalDate();
        const prevEnd = routine.endDate ?? today;
        const nextEnd = endDateEnabled && endDate ? endDate : today;
        const spanEnd = prevEnd > nextEnd ? prevEnd : nextEnd;
        affectedMonths = collectAffectedMonths({
          ranges: [{ startDate: routine.startDate, endDate: spanEnd }],
        });

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

      await refreshAffectedData({
        userId: user.uid,
        affectedMonths,
        queryClient,
      });

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
      const today = getTodayLocalDate();
      const end = routine.endDate ?? today;
      const affectedMonths = collectAffectedMonths({
        ranges: [{ startDate: routine.startDate, endDate: end }],
      });

      await deleteRoutine({
        userId: user.uid,
        routineId: routine.id,
      });

      await refreshAffectedData({
        userId: user.uid,
        affectedMonths,
        queryClient,
      });

      onClose();
    } catch {
      toast.error("루틴 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, handleDelete, isSubmitting };
};

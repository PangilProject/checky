import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
  type Routine,
} from "@/shared/api/routine";
import { monthlyStatsKeys, routinePageKeys } from "@/shared/api/keys";
import {
  collectAffectedMonths,
  refreshCalendarConsistency,
} from "@/shared/api/monthlyStats";
import {
  buildNextScheduleHistory,
  getRoutineValidationMessage,
  getTodayLocalDate,
} from "../utils";
import type { RoutineModalMode } from "../types";
import { toast } from "react-toastify";
import { useSubmitLock } from "@/shared/hooks/useSubmitLock";

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

const refreshAffectedData = async ({
  userId,
  affectedMonths,
  queryClient,
}: {
  userId: string;
  affectedMonths: string[];
  queryClient: ReturnType<typeof useQueryClient>;
}) => {
  const months = Array.from(
    new Set([
      ...affectedMonths,
      ...getCachedMonthlyStatsMonths({ queryClient, userId }),
    ]),
  );
  await refreshCalendarConsistency({
    queryClient,
    userId,
    affectedMonths: months,
    rebuild: true,
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
  const { isSubmitting, runExclusive } = useSubmitLock();

  const handleSubmit = async ({
    mode,
    title,
    selectedDays,
    startDate,
    effectiveFrom,
    endDateEnabled,
    endDate,
    isRepeatChanged,
    isDirty,
  }: {
    mode: RoutineModalMode;
    title: string;
    selectedDays: number[];
    startDate: string;
    effectiveFrom: string;
    endDateEnabled: boolean;
    endDate: string;
    isRepeatChanged: boolean;
    isDirty: boolean;
  }) => {
    // 검증 실패는 조용히 무시하지 않고 사유를 하나만 알린다.
    const validationMessage = getRoutineValidationMessage({
      mode,
      title,
      selectedDays,
      startDate,
      effectiveFrom,
      endDateEnabled,
      endDate,
      isRepeatChanged,
    });
    if (validationMessage) {
      toast.error(validationMessage, { toastId: "routine-form-validation" });
      return;
    }
    // 저장 버튼과 달리 Enter는 비활성화로 막을 수 없어 여기서도 확인한다.
    if (!isDirty) return;
    if (!user) return;

    // 저장 후 통계 갱신에서 실패하면 재저장을 유도하지 않도록 구분한다.
    let persisted = false;
    const trimmedTitle = title.trim();

    await runExclusive(async () => {
      try {
        let affectedMonths: string[] = [];

        if (mode === "CREATE") {
          await createRoutine({
            userId: user.uid,
            title: trimmedTitle,
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
            title: trimmedTitle,
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

        persisted = true;

        await refreshAffectedData({
          userId: user.uid,
          affectedMonths,
          queryClient,
        });

        onClose();
      } catch (e) {
        console.error("루틴 저장 실패", e);

        if (persisted) {
          // 저장은 끝났으므로 모달을 닫아 중복 저장을 유발하지 않는다.
          onClose();
          toast.warning(
            "저장은 완료됐지만 화면 갱신에 실패했습니다. 새로고침해주세요.",
          );
          return;
        }

        toast.error("루틴 저장에 실패했습니다.");
      }
    });
  };

  const handleDelete = async () => {
    if (!user || !routine) return;

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
    } catch (e) {
      console.error("루틴 삭제 실패", e);
    }
  };

  return { handleSubmit, handleDelete, isSubmitting };
};

import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
  type Routine,
} from "@/shared/api/routine";
import {
  monthlyStatsKeys,
  routineKeys,
  routineReportKeys,
} from "@/shared/api/keys";
import {
  buildMonthKeysBetween,
  rebuildMonthlyStatsByMonth,
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
      ...getCachedMonthlyStatsMonths({
        queryClient,
        userId,
      }),
    ]),
  );

  if (months.length > 0) {
    await Promise.all(
      months.map((month) =>
        rebuildMonthlyStatsByMonth({
          userId,
          month,
        }),
      ),
    );

    months.forEach((month) => {
      queryClient.removeQueries({
        queryKey: monthlyStatsKeys.byMonth(userId, month),
      });
    });
  }

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: routineKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: monthlyStatsKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: routineReportKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: ["routinePageData", userId],
    }),
  ]);
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
    if (!title.trim() || selectedDays.length === 0 || !user) return;
    if (mode === "EDIT" && isRepeatChanged && !effectiveFrom) return;
    if (endDateEnabled && !endDate) return;
    if (endDateEnabled && endDate < startDate) return;

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
        affectedMonths = buildMonthKeysBetween(startDate, end);
      }

      if (mode === "EDIT" && routine) {
        const today = getTodayLocalDate();
        const prevEnd = routine.endDate ?? today;
        const nextEnd = endDateEnabled && endDate ? endDate : today;
        const spanEnd = prevEnd > nextEnd ? prevEnd : nextEnd;
        affectedMonths = buildMonthKeysBetween(routine.startDate, spanEnd);

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
    } catch (e) {
      console.error("루틴 저장 실패", e);
    }
  };

  const handleDelete = async () => {
    if (!user || !routine) return;

    try {
      const today = getTodayLocalDate();
      const end = routine.endDate ?? today;
      const affectedMonths = buildMonthKeysBetween(routine.startDate, end);

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

  return { handleSubmit, handleDelete };
};

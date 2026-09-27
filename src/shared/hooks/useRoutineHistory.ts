import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { routineLogKeys } from "@/shared/api/keys";
import { getRoutineLogsByRoutineOnce } from "@/shared/api/routineLog";
import {
  buildRoutineDays,
  summarizeRoutineDays,
  type Routine,
} from "@/shared/api/routine";
import { formatDateToYmd, parseYmd } from "@/shared/utils/formatDate";

export type RoutineHistoryPeriod = "month" | "quarter";

/** 기간별로 보여 줄 주 수. 한 칸이 한 주다 */
export const ROUTINE_HISTORY_WEEKS: Record<RoutineHistoryPeriod, number> = {
  month: 5,
  quarter: 13,
};

/** 오늘이 든 주의 토요일에서 끝나, 일요일로 시작하는 weeks 주 */
export const getRoutineHistoryRange = (todayYmd: string, weeks: number) => {
  const today = parseYmd(todayYmd) ?? new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + (6 - today.getDay()));
  const start = new Date(end);
  start.setDate(end.getDate() - weeks * 7 + 1);
  return { startDate: formatDateToYmd(start), endDate: formatDateToYmd(end) };
};

/**
 * 루틴 하나의 최근 기록을 읽어 날짜별 상태와 합계를 낸다.
 *
 * 기록은 가장 긴 기간(13주) 한 번만 읽고, 짧은 기간은 그 안에서 잘라 쓴다.
 * 기간을 바꿀 때마다 다시 읽지 않기 위해서다. 읽기는 그 13주에 남긴 기록 수만큼이다.
 * 홈에서 루틴을 체크하면 useRoutineToggle 이 이 캐시를 무효화한다.
 */
export const useRoutineHistory = ({
  routine,
  period,
  todayYmd,
}: {
  routine: Routine;
  period: RoutineHistoryPeriod;
  todayYmd: string;
}) => {
  const { user } = useAuth();
  const userId = user?.uid ?? "";

  const fetchRange = useMemo(
    () => getRoutineHistoryRange(todayYmd, ROUTINE_HISTORY_WEEKS.quarter),
    [todayYmd],
  );
  const shownRange = useMemo(
    () => getRoutineHistoryRange(todayYmd, ROUTINE_HISTORY_WEEKS[period]),
    [todayYmd, period],
  );

  const logsQuery = useQuery({
    queryKey: routineLogKeys.byRoutine(
      userId,
      routine.id,
      fetchRange.startDate,
      fetchRange.endDate,
    ),
    queryFn: () =>
      getRoutineLogsByRoutineOnce({
        userId,
        routineId: routine.id,
        startDate: fetchRange.startDate,
        endDate: todayYmd,
      }),
    enabled: Boolean(userId),
  });

  const days = useMemo(
    () =>
      logsQuery.data
        ? buildRoutineDays({
            routine,
            logs: logsQuery.data,
            ...shownRange,
            cutoffDate: todayYmd,
          })
        : [],
    [logsQuery.data, routine, shownRange, todayYmd],
  );

  const summary = useMemo(
    () => summarizeRoutineDays({ routine, days }),
    [routine, days],
  );

  return {
    days,
    summary,
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    refetch: logsQuery.refetch,
  };
};

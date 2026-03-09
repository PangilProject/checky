import { useQuery } from "@tanstack/react-query";
import { routineReportKeys } from "@/shared/query/keys";
import { getRoutineReportByWeek, type RoutineReport } from "@/shared/api/routine";

interface UseRoutineReportQueryParams {
  userId?: string;
  startDate: string;
  endDate: string;
}

export const useRoutineReportQuery = ({
  userId,
  startDate,
  endDate,
}: UseRoutineReportQueryParams) => {
  return useQuery<RoutineReport>({
    queryKey: routineReportKeys.byWeek(userId ?? "", startDate, endDate),
    queryFn: () => {
      if (!userId) {
        throw new Error("userId가 필요합니다.");
      }
      return getRoutineReportByWeek({ userId, startDate, endDate });
    },
    enabled: Boolean(userId && startDate && endDate),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });
};

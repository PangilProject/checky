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
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });
};

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { routineReportKeys } from "@/shared/api/keys";
import { getRoutineReportByWeek, type RoutineReport } from "@/shared/api/routine";
import { fetchCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";

interface UseRoutineReportQueryParams {
  userId?: string;
  startDate: string;
  endDate: string;
}

/**
 * useRoutineReportQuery
 * : 특정 주의 루틴 리포트를 가져오는 쿼리 훅
 * @param userId - 사용자 ID
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns useQuery 훅의 반환값
 */
export const useRoutineReportQuery = ({
  userId,
  startDate,
  endDate,
}: UseRoutineReportQueryParams) => {
  const queryClient = useQueryClient();

  // useQuery 훅을 사용하여 루틴 리포트를 가져옵니다.
  return useQuery<RoutineReport>({
    // 1. 쿼리 키를 설정
    queryKey: routineReportKeys.byWeek(userId ?? "", startDate, endDate),
    // 2. 쿼리 함수를 설정
    queryFn: async () => {
      // userId가 없으면 에러를 발생
      if (!userId) throw new Error("userId가 필요합니다.");
      // 카테고리는 주마다 다시 읽지 않도록 정본 캐시에서 조달
      const categories = await fetchCategoriesQuery(queryClient, userId);
      // 루틴 리포트를 가져옴
      return getRoutineReportByWeek({ userId, startDate, endDate, categories });
    },

    // 3. 쿼리가 활성화될 조건을 설정 (캐시 정책은 전역 기본값을 따른다)
    enabled: Boolean(userId && startDate && endDate),
    // 4. 플레이스홀더 데이터 설정
    placeholderData: (previous) => previous,
  });
};

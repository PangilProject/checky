import { useQuery } from "@tanstack/react-query";
import { routineReportKeys } from "@/shared/api/keys";
import { getRoutineReportByWeek, type RoutineReport } from "@/shared/api/routine";

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
  // useQuery 훅을 사용하여 루틴 리포트를 가져옵니다.
  return useQuery<RoutineReport>({
    // 1. 쿼리 키를 설정
    queryKey: routineReportKeys.byWeek(userId ?? "", startDate, endDate),
    // 2. 쿼리 함수를 설정
    queryFn: () => {
      // userId가 없으면 에러를 발생
      if (!userId) throw new Error("userId가 필요합니다.");
      // 루틴 리포트를 가져옴
      return getRoutineReportByWeek({ userId, startDate, endDate });
    },

    /*
      3. 캐싱 관련 설정
    */
    // 3-1. 쿼리가 활성화될 조건을 설정
    enabled: Boolean(userId && startDate && endDate),
    // 3-2. 데이터가 신선하다고 간주되는 시간(10분)
    staleTime: 10 * 60_000, 
    // 3-3. 가비지 컬렉션에서 데이터를 유지하는 시간(30분)
    gcTime: 30 * 60_000,     
    // 3-4. 창이 포커스될 때 리페치하지 않음
    refetchOnWindowFocus: false,     
    // 3-5. // 마운트될 때 리페치하지 않음
    refetchOnMount: false, 
    // 3-6. 플레이스홀더 데이터 설정
    placeholderData: (previous) => previous, 
  });
};

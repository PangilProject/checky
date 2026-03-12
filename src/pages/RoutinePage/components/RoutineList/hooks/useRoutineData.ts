import { useQuery } from "@tanstack/react-query";
import { getCategoriesOnce } from "@/shared/api/category";
import { getRoutinesByCategory } from "@/shared/api/routine";

/**
 * hook: 루틴 페이지 데이터 조회
 */

export const useRoutineData = (userId: string, enabled: boolean) => {
  return useQuery({
    // 사용자별 캐싱을 위한 queryKey (userId 기준으로 캐시 분리)
    queryKey: ["routinePageData", userId],

    // 카테고리 + 루틴 데이터를 함께 가져오는 비동기 함수
    queryFn: async () => {
      // 1. 활성화된 카테고리 목록 조회
      const categories = await getCategoriesOnce({
        userId,
        status: "ACTIVE",
      });

      // 2. 각 카테고리별 루틴을 병렬로 조회
      const routinesByCategory = await Promise.all(
        categories.map(async (category) => ({
          category,
          routines: await getRoutinesByCategory({
            userId,
            categoryId: category.id,
          }),
        })),
      );

      return routinesByCategory;
    },

    enabled, // 로그인 상태일 때만 요청 실행
    staleTime: 10 * 60_000, // 데이터가 10분 동안 신선한 상태로 유지 (재요청 방지)
    gcTime: 30 * 60_000, // 캐시를 30분 동안 유지 (메모리 관리)
    refetchOnWindowFocus: false, // 탭 포커스 시 자동 refetch 방지 (UX 안정성)
    refetchOnMount: false, // 컴포넌트 마운트 시 재요청 방지
    placeholderData: (prev) => prev, // 이전 데이터를 유지하여 로딩 시 UI 깜빡임 방지
  });
};

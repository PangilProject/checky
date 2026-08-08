import { useQuery } from "@tanstack/react-query";
import { getCategoriesOnce } from "@/shared/api/category";
import { getRoutinesByCategory } from "@/shared/api/routine";
import { routinePageKeys } from "@/shared/api/keys";

/**
 * hook: 루틴 페이지 데이터 조회
 */

export const useRoutineData = (userId: string, enabled: boolean) => {
  return useQuery({
    // 사용자별 캐싱을 위한 queryKey (userId 기준으로 캐시 분리)
    queryKey: routinePageKeys.detail(userId),

    // 카테고리 + 루틴 데이터를 함께 가져오는 비동기 함수
    queryFn: async () => {
      // 1. 종료한 것까지 포함해 카테고리를 모두 조회
      //    종료한 카테고리를 빼면 그 안의 루틴을 고치거나 지울 방법이 사라진다.
      //    홈의 주간 표에는 계속 나오므로 매일 체크해야 하는 것처럼 보이기만 한다.
      const categories = await getCategoriesOnce({ userId });

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

      // 3. 사용 중인 카테고리와, 루틴이 남아 있는 종료된 카테고리만 남긴다.
      //    루틴이 없는 종료된 카테고리까지 그리면 빈 줄만 늘어난다.
      return routinesByCategory.filter(
        ({ category, routines }) =>
          category.status === "ACTIVE" || routines.length > 0,
      );
    },

    enabled, // 로그인 상태일 때만 요청 실행
    staleTime: 10 * 60_000, // 데이터가 10분 동안 신선한 상태로 유지 (재요청 방지)
    gcTime: 30 * 60_000, // 캐시를 30분 동안 유지 (메모리 관리)
    refetchOnWindowFocus: false, // 탭 포커스 시 자동 refetch 방지 (UX 안정성)
    refetchOnMount: false, // 컴포넌트 마운트 시 재요청 방지
    placeholderData: (prev) => prev, // 이전 데이터를 유지하여 로딩 시 UI 깜빡임 방지
  });
};

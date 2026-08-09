import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRoutinesOnce, type Routine } from "@/shared/api/routine";
import { routinePageKeys } from "@/shared/api/keys";
import { fetchCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";

/**
 * hook: 루틴 페이지 데이터 조회
 */

export const useRoutineData = (userId: string, enabled: boolean) => {
  const queryClient = useQueryClient();

  return useQuery({
    // 사용자별 캐싱을 위한 queryKey (userId 기준으로 캐시 분리)
    queryKey: routinePageKeys.detail(userId),

    // 카테고리 + 루틴 데이터를 함께 가져오는 비동기 함수
    queryFn: async () => {
      // 1. 종료한 것까지 포함해 카테고리를 모두 조회 (정본 캐시 재사용)
      //    종료한 카테고리를 빼면 그 안의 루틴을 고치거나 지울 방법이 사라진다.
      //    홈의 주간 표에는 계속 나오므로 매일 체크해야 하는 것처럼 보이기만 한다.
      // 2. 루틴은 한 번에 전부 읽는다. 분류마다 나눠 읽으면 빈 분류도
      //    쿼리마다 최소 1 read 로 과금되고 왕복이 분류 수만큼 늘어난다.
      const [categories, routines] = await Promise.all([
        fetchCategoriesQuery(queryClient, userId),
        getRoutinesOnce(userId),
      ]);

      // 3. 분류별로 묶고 순서 값으로 정렬한다. orderIndex 가 없던 시절의
      //    루틴도 목록에 나오도록 0 으로 보고 정렬한다.
      const routinesByCategoryId = new Map<string, Routine[]>();
      routines.forEach((routine) => {
        const group = routinesByCategoryId.get(routine.categoryId) ?? [];
        group.push(routine);
        routinesByCategoryId.set(routine.categoryId, group);
      });
      routinesByCategoryId.forEach((group) =>
        group.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
      );

      // 4. 사용 중인 카테고리와, 루틴이 남아 있는 종료된 카테고리만 남긴다.
      //    루틴이 없는 종료된 카테고리까지 그리면 빈 줄만 늘어난다.
      return categories
        .map((category) => ({
          category,
          routines: routinesByCategoryId.get(category.id) ?? [],
        }))
        .filter(
          ({ category, routines: group }) =>
            category.status === "ACTIVE" || group.length > 0,
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

/**
 * 카테고리 변경 후 갱신해야 하는 모든 캐시를 한곳에서 무효화한다.
 *
 * 카테고리(ACTIVE/ENDED)는 다음 두 캐시에 걸쳐 사용된다.
 *  1) categoryKeys.all  - 카테고리 페이지, 할 일 페이지의 카테고리 목록
 *  2) routinePageKeys   - 루틴 페이지가 활성 카테고리를 내부에 포함해 조회
 *
 * 생성·수정·종료·복구 등 카테고리 mutation 직후 이 헬퍼를 호출하면
 * 무효화 누락으로 화면이 갱신되지 않는 문제를 막을 수 있다.
 */

import type { QueryClient } from "@tanstack/react-query";
import { categoryKeys, routinePageKeys } from "@/shared/api/keys";

/**
 * 분류 변경 뒤 다시 읽어야 하는 캐시를 모두 무효화한다.
 *
 * 분류 목록뿐 아니라 루틴 페이지도 활성 분류를 품고 있어 함께 갱신해야 한다.
 * @param queryClient React Query 클라이언트
 * @param userId 대상 사용자 ID
 */
export const invalidateCategoryQueries = async (
  queryClient: QueryClient,
  userId: string,
) => {
  await Promise.all([
    // ACTIVE / ENDED 두 목록을 모두 커버하기 위해 all 단위로 무효화
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
    queryClient.invalidateQueries({
      queryKey: routinePageKeys.detail(userId),
    }),
  ]);
};

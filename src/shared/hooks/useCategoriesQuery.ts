import { useCallback } from "react";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import { categoryKeys } from "@/shared/api/keys";
import {
  getCategoriesOnce,
  type Category,
  type CategoryStatus,
} from "@/shared/api/category";

/**
 * 카테고리 캐시의 정본.
 *
 * 카테고리는 화면 여럿(홈 목록, 주간 리포트, 분류 페이지, 루틴 페이지)이 같이 쓰는데,
 * 각자 다른 키로 조회하면 같은 컬렉션을 화면마다 다시 읽는다.
 * 그래서 무필터 전체 조회 하나만 캐시하고, 상태별 목록은 select 로 파생한다.
 */
const categoriesQueryOptions = (userId: string) => ({
  queryKey: categoryKeys.list(userId),
  queryFn: () => getCategoriesOnce({ userId }),
  // fetchQuery 경로에서도 캐시 신선도 판단이 명확하도록 여기 명시한다
  // (값은 전역 기본과 같다).
  staleTime: 10 * 60_000,
  gcTime: 30 * 60_000,
});

/**
 * 카테고리 목록 공용 쿼리 훅.
 *
 * status 를 넘기면 캐시에서 걸러 돌려준다. 서버 쿼리와 캐시 항목은 늘지 않는다.
 */
export const useCategoriesQuery = (
  userId: string,
  options?: { status?: CategoryStatus; enabled?: boolean }
) => {
  const status = options?.status;
  const select = useCallback(
    (categories: Category[]) =>
      status
        ? categories.filter((category) => category.status === status)
        : categories,
    [status]
  );

  return useQuery({
    ...categoriesQueryOptions(userId),
    enabled: options?.enabled ?? Boolean(userId),
    placeholderData: (previous: Category[] | undefined) => previous,
    select,
  });
};

/**
 * queryFn 등 훅을 쓸 수 없는 곳에서 정본 캐시를 재사용해 카테고리를 가져온다.
 *
 * 캐시가 신선하면 읽기 없이 돌려주고, 같은 요청이 진행 중이면 그 결과를 같이 쓴다.
 */
export const fetchCategoriesQuery = (
  queryClient: QueryClient,
  userId: string
): Promise<Category[]> => queryClient.fetchQuery(categoriesQueryOptions(userId));

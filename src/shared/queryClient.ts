import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

/**
 * 앱 표준 캐시 정책. 훅에는 기본과 다른 옵션만 남긴다.
 *
 * 기본값이 없으면 옵션을 잊은 훅이 staleTime 0 + 포커스 refetch + retry 3 을
 * 조용히 상속해, 화면 하나가 Firestore read 를 반복 과금한다.
 *
 * read 를 줄이는 일은 staleTime 이 맡는다. refetchOnMount 는 끄지 않는다.
 * 껐더니 화면을 벗어난 사이에 무효화된 쿼리가 돌아와도 다시 읽지 않아,
 * 다른 페이지에서 만든 루틴이 홈에 나타나지 않았다.
 * invalidateQueries 는 떠 있지 않은 쿼리에는 "낡음" 표시만 남기고,
 * 그 표시를 실행하는 것이 바로 마운트 시 재조회이기 때문이다.
 * 기본값(true)은 "낡았을 때만" 다시 읽으므로 staleTime 안에서는 조회가 늘지 않는다.
 */
export const queryDefaultOptions: DefaultOptions = {
  queries: {
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    // 권한 오류나 인덱스 누락은 재시도해도 실패한다. 기본 3회는 실패 쿼리를
    // 4번 과금하므로 1회로 줄인다.
    retry: 1,
  },
};

export const createQueryClient = () =>
  new QueryClient({ defaultOptions: queryDefaultOptions });

/**
 * 정렬 순서를 저장한 뒤 캐시를 새 순서로 맞춘다.
 *
 * 순서 저장은 서버에 무엇을 썼는지 이미 알고 있는 mutation 이다. 무효화해서
 * 다시 읽으면 방금 보낸 값을 확인하려고 Firestore read 를 한 번 더 쓰게 되므로,
 * 캐시를 직접 새 순서로 바꾼다.
 *
 * 이 처리가 없으면 화면은 로컬 상태 덕에 맞아 보이지만 캐시에는 옛 순서가 남는다.
 * staleTime 안에서는 다시 마운트해도 서버를 읽지 않으므로, 다른 탭에 갔다 오면
 * 옛 순서가 그대로 나오고 새로고침해야만 맞아 보인다.
 */

import type { QueryClient } from "@tanstack/react-query";
import {
  categoryKeys,
  routinePageKeys,
  routineReportKeys,
} from "@/shared/api/keys";
import type { RoutineReport } from "@/shared/api/routine";
import type { Category } from "./types";

/**
 * 서버가 돌려주는 차례와 같게 맞춘다.
 *
 * 정렬은 orderBy("orderIndex") 하나뿐이라 값이 같으면 문서 id 순으로 온다.
 * ACTIVE 와 ENDED 가 각각 0 부터 번호를 매겨 값이 겹치므로 여기서 갈린다.
 * 화면은 상태별로 걸러 쓰기 때문에 이 차이가 보이지는 않지만, 다시 읽었을 때
 * 캐시와 순서가 어긋나지 않도록 같은 규칙을 쓴다.
 */
const byOrderThenId = (a: Category, b: Category) =>
  a.orderIndex - b.orderIndex || a.id.localeCompare(b.id);

/**
 * 카테고리 순서를 캐시에 반영한다.
 *
 * @param ordered 방금 저장한 항목들의 새 orderIndex. 드래그한 한 섹션만 담긴다.
 * @returns 캐시를 고쳤으면 true. 정본 캐시가 없어 손대지 못했으면 false —
 *          호출부가 무효화로 넘어갈 수 있게 알린다.
 */
export const applyCategoryOrderToCache = (
  queryClient: QueryClient,
  userId: string,
  ordered: { id: string; orderIndex: number }[],
) => {
  const previous = queryClient.getQueryData<Category[]>(
    categoryKeys.list(userId),
  );
  if (!previous) return false;

  const nextOrderById = new Map(
    ordered.map(({ id, orderIndex }) => [id, orderIndex]),
  );
  const next = previous
    .map((category) => {
      const orderIndex = nextOrderById.get(category.id);
      return orderIndex === undefined ? category : { ...category, orderIndex };
    })
    .sort(byOrderThenId);

  queryClient.setQueryData(categoryKeys.list(userId), next);

  // 루틴 페이지는 카테고리별 묶음을 이 순서대로 늘어놓는다. 같은 캐시에서 파생된
  // 것이 아니라 따로 저장된 결과라, 카테고리만 고치면 루틴 쪽 순서가 남는다.
  // orderIndex 로 다시 정렬하지 않고 위에서 정한 자리를 그대로 쓴다 —
  // 두 곳이 같은 규칙을 각자 구현하면 언젠가 갈린다.
  const positionById = new Map(next.map((category, index) => [category.id, index]));
  queryClient.setQueryData<{ category: Category }[]>(
    routinePageKeys.detail(userId),
    (groups) =>
      groups
        ? [...groups].sort(
            (a, b) =>
              (positionById.get(a.category.id) ?? 0) -
              (positionById.get(b.category.id) ?? 0),
          )
        : groups,
  );

  // 홈의 주간 루틴 표는 만들 때 분류 순서를 줄 순서로 박아 넣는다(report.ts).
  // 주마다 캐시가 따로 있으므로 걸려 있는 주를 모두 훑는다.
  // 같은 분류 안의 줄 순서는 건드리지 않아야 하는데, 분류 자리만 비교하는
  // 정렬은 JS 의 정렬이 안정 정렬이라 같은 분류끼리의 차례를 그대로 둔다.
  queryClient.setQueriesData<RoutineReport>(
    { queryKey: routineReportKeys.all },
    (report) =>
      report
        ? {
            ...report,
            rows: [...report.rows].sort(
              (a, b) =>
                (positionById.get(a.category.id) ?? 0) -
                (positionById.get(b.category.id) ?? 0),
            ),
          }
        : report,
  );

  return true;
};

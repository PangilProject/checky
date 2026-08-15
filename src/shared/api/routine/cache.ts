/**
 * 루틴 순서를 저장한 뒤 캐시를 새 순서로 맞춘다.
 *
 * 무엇을 저장했는지 이미 아는 mutation 이라, 무효화해서 다시 읽는 대신
 * 캐시를 직접 고쳐 Firestore read 를 늘리지 않는다.
 */

import type { QueryClient } from "@tanstack/react-query";
import { routineReportKeys } from "@/shared/api/keys";
import type { RoutineReport } from "./types";

/**
 * 홈의 주간 루틴 표를 새 루틴 순서로 맞춘다.
 *
 * 표는 만들 때 분류 순서와 루틴 순서를 줄 순서로 박아 넣는다(report.ts).
 * 주마다 캐시가 따로 있으므로 걸려 있는 주를 모두 훑는다.
 *
 * 분류 사이의 자리는 건드리지 않는다. 바뀐 것은 한 분류 안의 차례뿐이므로,
 * 그 분류의 줄이 놓여 있던 자리를 그대로 두고 내용만 새 차례로 채워 넣는다.
 * 전체를 다시 정렬하면 여기서도 분류 순서를 알아야 하고, 같은 규칙이 두 곳에
 * 생겨 언젠가 갈린다.
 *
 * @param orderedRoutineIds 해당 분류의 루틴 id 를 새 차례대로 담은 것
 */
export const applyRoutineOrderToReportCache = (
  queryClient: QueryClient,
  categoryId: string,
  orderedRoutineIds: string[],
) => {
  const positionById = new Map(
    orderedRoutineIds.map((id, index) => [id, index]),
  );

  queryClient.setQueriesData<RoutineReport>(
    { queryKey: routineReportKeys.all },
    (report) => {
      if (!report) return report;

      const slots: number[] = [];
      report.rows.forEach((row, index) => {
        if (row.category.id === categoryId) slots.push(index);
      });
      if (slots.length === 0) return report;

      // 이 주에 안 보이는 루틴도 있으므로(시작 전이거나 반복 요일이 없는 주)
      // 새 차례에서 빠진 줄은 뒤로 밀어 둔다.
      const reordered = slots
        .map((index) => report.rows[index])
        .sort(
          (a, b) =>
            (positionById.get(a.routineId) ?? Number.MAX_SAFE_INTEGER) -
            (positionById.get(b.routineId) ?? Number.MAX_SAFE_INTEGER),
        );

      const rows = [...report.rows];
      slots.forEach((slot, i) => {
        rows[slot] = reordered[i];
      });

      return { ...report, rows };
    },
  );
};

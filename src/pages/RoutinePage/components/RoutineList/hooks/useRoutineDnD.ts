import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  applyRoutineOrderToReportCache,
  updateRoutineOrder,
} from "@/shared/api/routine";
import { routinePageKeys } from "@/shared/api/keys";
import { useDebouncedCommit } from "@/shared/hooks/useDebouncedCommit";
import type { Routine, RoutineCategory } from "@/shared/api/routine";

/**
 * 루틴 정렬의 낙관적 반영과 서버 저장을 처리하는 커스텀 훅.
 *
 * 어느 항목이 어디로 갔는지 계산하는 것은 SortableList 가 맡고,
 * 여기서는 정해진 새 차례를 화면·캐시·서버에 반영하는 일만 한다.
 */

export const useRoutineDnD = (
  userId: string,
  setRoutineCategories: React.Dispatch<
    React.SetStateAction<RoutineCategory[] | null>
  >,
) => {
  const queryClient = useQueryClient();
  const { schedule: scheduleOrderCommit } = useDebouncedCommit();

  const handleReorder = (newList: Routine[], categoryId: string) => {
    // 1. Optimistic Update
    // → 서버 응답을 기다리지 않고 UI를 즉시 업데이트하여 UX 개선
    setRoutineCategories((prev) => {
      const safePrev = prev ?? [];
      return safePrev.map((item) =>
        item.category.id === categoryId ? { ...item, routines: newList } : item,
      );
    });

    // 2. 서버 반영은 연속 드래그를 마지막 상태 한 번으로 합쳐 보낸다.
    //    실패하면 알리고 서버 상태를 다시 읽어 온다. 손으로 되돌리면
    //    합쳐진 드래그의 중간 상태로만 돌아가 오히려 어긋난다.
    const ordered = newList.map((routine, index) => ({
      ...routine,
      orderIndex: index,
    }));

    scheduleOrderCommit(`routines:${categoryId}`, () =>
      updateRoutineOrder({
        userId,
        routines: ordered.map(({ id, orderIndex }) => ({ id, orderIndex })),
      })
        .then(() => {
          // 화면은 로컬 상태로 맞아 보여도 캐시에는 옛 순서가 남는다. 캐시가
          // 낡았다고 표시되지 않으므로 다시 마운트해도 서버를 읽지 않아,
          // 다른 화면에 갔다 오면 옛 순서가 그대로 나온다.
          // 무엇을 저장했는지 아는 상황이라 다시 읽지 않고 캐시를 직접 고친다.
          queryClient.setQueryData<RoutineCategory[]>(
            routinePageKeys.detail(userId),
            (groups) =>
              groups?.map((group) =>
                group.category.id === categoryId
                  ? { ...group, routines: ordered }
                  : group,
              ),
          );
          // 홈의 주간 표도 같은 순서를 쓰지만 주마다 캐시가 따로다
          applyRoutineOrderToReportCache(
            queryClient,
            categoryId,
            ordered.map((routine) => routine.id),
          );
        })
        .catch(() => {
          toast.error("순서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          void queryClient.invalidateQueries({
            queryKey: routinePageKeys.detail(userId),
          });
        }),
    );
  };

  return { handleReorder };
};

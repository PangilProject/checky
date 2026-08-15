import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  applyRoutineOrderToReportCache,
  updateRoutineOrder,
} from "@/shared/api/routine";
import { routinePageKeys } from "@/shared/api/keys";
import { useDebouncedCommit } from "@/shared/hooks/useDebouncedCommit";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Routine, RoutineCategory } from "@/shared/api/routine";

/**
 * 루틴 Drag & Drop 정렬을 처리하는 커스텀 훅
 */

export const useRoutineDnD = (
  userId: string,
  setRoutineCategories: React.Dispatch<
    React.SetStateAction<RoutineCategory[] | null>
  >,
) => {
  const queryClient = useQueryClient();
  const { schedule: scheduleOrderCommit } = useDebouncedCommit();

  const handleDragEnd = (
    event: DragEndEvent,
    routines: Routine[],
    categoryId: string,
  ) => {
    const { active, over } = event;

    // 드롭 위치가 없거나, 동일한 위치로 이동한 경우 무시
    if (!over || active.id === over.id) return;

    // 드래그된 요소와 드롭 위치의 index 계산
    const oldIndex = routines.findIndex((r) => r.id === active.id);
    const newIndex = routines.findIndex((r) => r.id === over.id);

    // 유효하지 않은 index 방어 처리
    if (oldIndex < 0 || newIndex < 0) return;

    // 새로운 순서로 배열 재정렬 (불변성 유지)
    const newList = arrayMove<Routine>(routines, oldIndex, newIndex);

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

  return { handleDragEnd };
};

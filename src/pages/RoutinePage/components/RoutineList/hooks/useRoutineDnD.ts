import { arrayMove } from "@dnd-kit/sortable";
import { updateRoutineOrder } from "@/shared/api/routine";
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

    // 2. 서버에 변경된 순서 반영 (orderIndex 기반)
    updateRoutineOrder({
      userId,
      routines: newList.map((r, index) => ({
        id: r.id,
        orderIndex: index,
      })),
    }).catch((error) => {
      console.error("[Routine] order update failed:", error);

      // 3. Rollback
      // → 서버 업데이트 실패 시, 기존 상태로 되돌려 데이터 정합성 유지
      setRoutineCategories((prev) => {
        const safePrev = prev ?? [];
        return safePrev.map((item) =>
          item.category.id === categoryId ? { ...item, routines } : item,
        );
      });
    });
  };

  return { handleDragEnd };
};

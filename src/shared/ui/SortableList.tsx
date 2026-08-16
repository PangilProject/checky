import type { ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

/**
 * 세로 목록 드래그 정렬.
 *
 * 분류·루틴·할 일 목록이 같은 배선을 각자 들고 있었다. 특히 드래그를 시작하는
 * 감도(얼마나 오래 눌러야 하는가)는 화면마다 다르면 안 되는 제품 단위 결정인데,
 * 세 곳에 흩어져 있어 한 곳만 고치면 조용히 갈렸다.
 */

/**
 * 드래그 시작 감도.
 *
 * 목록 항목은 눌러서 여는 동작도 겸하므로, 짧게 누른 것은 드래그로 보지 않는다.
 * tolerance 는 누르는 동안의 손떨림을 허용해 드래그가 끊기지 않게 한다.
 */
const ACTIVATION_CONSTRAINT = { delay: 150, tolerance: 5 };

interface SortableListProps<T> {
  items: T[];
  /** 항목에서 dnd-kit 이 쓸 id 를 뽑는다 */
  getId: (item: T) => string;
  /**
   * 새 차례가 정해졌을 때 불린다. 제자리 드롭이나 알 수 없는 항목은 걸러진 뒤다.
   * 화면 반영과 서버 저장은 호출부가 맡는다.
   */
  onReorder: (nextItems: T[]) => void;
  children: ReactNode;
}

export function SortableList<T>({
  items,
  getId,
  onReorder,
  children,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: ACTIVATION_CONSTRAINT }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // 드롭 위치가 없거나 제자리로 놓았으면 아무 일도 없다
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => getId(item) === active.id);
    const newIndex = items.findIndex((item) => getId(item) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

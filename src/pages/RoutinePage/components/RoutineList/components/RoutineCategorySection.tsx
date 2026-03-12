import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { TitleText } from "@/shared/ui/TitleText";
import { NormalBlackButton } from "@/shared/ui/Button";
import { getCategoryTextColor } from "@/shared/utils/getCategoryTextColor";
import { RoutineItem } from "./RoutineItem";
import type { Routine, RoutineCategory } from "@/shared/api/routine";

type Props = {
  category: RoutineCategory["category"]; // or Category 타입
  routines: Routine[];
  onDragEnd: (event: DragEndEvent) => void;
  onAdd: () => void;
  onSelect: (routine: Routine) => void;
};

/**
 * 카테고리별 루틴 목록을 렌더링하는 컴포넌트
 */

export const RoutineCategorySection = ({
  category,
  routines,
  onDragEnd,
  onAdd,
  onSelect,
}: Props) => {
  /**
   * dnd-kit 센서 설정
   *
   * - PointerSensor: 마우스/터치 기반 드래그 감지
   * - delay: 150ms 이상 눌러야 드래그 시작 (오작동 방지)
   * - tolerance: 약간의 움직임 허용
   */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  return (
    <div>
      {/* 카테고리 헤더 */}
      <div className="flex justify-between items-center">
        <TitleText
          text={category.name}
          className={getCategoryTextColor(category.color)}
        />
        <NormalBlackButton text="추가" onClick={onAdd} />
      </div>

      {/* Drag & Drop 영역 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // 가장 가까운 요소 기준으로 drop 위치 계산
        onDragEnd={onDragEnd} // 드래그 종료 시 순서 변경 처리
        modifiers={[restrictToVerticalAxis]} // 세로 방향으로만 이동 제한
      >
        <SortableContext
          items={routines.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* 루틴 리스트 렌더링 */}
          {routines.map((routine) => (
            <RoutineItem
              key={routine.id}
              routine={routine}
              onClickMore={() => onSelect(routine)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

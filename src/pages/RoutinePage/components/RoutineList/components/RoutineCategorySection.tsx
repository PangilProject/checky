import { SortableList } from "@/shared/ui/SortableList";
import { Button, Stack, Text } from "@/shared/ui/primitives";
import { getCategoryTextColor } from "@/shared/constants/colors";
import { RoutineItem } from "./RoutineItem";
import type { Routine, RoutineCategory } from "@/shared/api/routine";

type Props = {
  category: RoutineCategory["category"]; // or Category 타입
  routines: Routine[];
  onReorder: (nextRoutines: Routine[]) => void;
  onAdd: () => void;
  onSelect: (routine: Routine) => void;
};

/**
 * 카테고리별 루틴 목록을 렌더링하는 컴포넌트
 */

export const RoutineCategorySection = ({
  category,
  routines,
  onReorder,
  onAdd,
  onSelect,
}: Props) => {
  // 종료한 카테고리에는 새 루틴을 넣지 못한다.
  // 다만 이미 있는 루틴은 그대로 보여 줘야 고치거나 지울 수 있다.
  const isEnded = category.status !== "ACTIVE";

  return (
    <div className="mb-5">
      {/* 카테고리 헤더 */}
      <Stack
        gap={2}
        direction="row"
        justify="between"
        align="center"
        className="mb-2"
      >
        <Text
          variant="title"
          // 저장된 hex 가 아니라 테마에 맞게 고른 색으로 그린다
          style={{ color: getCategoryTextColor(category.color) }}
          className="min-w-0 truncate"
        >
          {category.name}
        </Text>
        <span className="shrink-0">
          {isEnded ? (
            // 왜 더할 수 없는지 알 수 있도록 상태를 적어 둔다
            <span className="text-sm text-content-muted">종료됨</span>
          ) : (
            <Button onClick={onAdd}>추가</Button>
          )}
        </span>
      </Stack>

      {/* 분류를 방금 만든 직후가 가장 허전한 지점이라, 다음에 할 일을 적어 둔다 */}
      {routines.length === 0 && (
        <p className="pl-1 pb-1 text-sm text-content-muted">
          {isEnded
            ? "루틴이 없습니다."
            : "추가를 눌러 이 분류의 첫 루틴을 만들어보세요."}
        </p>
      )}

      {/* Drag & Drop 영역 */}
      <SortableList
        items={routines}
        getId={(routine) => routine.id}
        onReorder={onReorder}
      >
        <Stack gap={2} direction="col">
          {routines.map((routine) => (
            <RoutineItem
              key={routine.id}
              routine={routine}
              onClickMore={() => onSelect(routine)}
            />
          ))}
        </Stack>
      </SortableList>
    </div>
  );
};

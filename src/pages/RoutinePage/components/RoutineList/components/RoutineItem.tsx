import type { Routine } from "@/shared/api/routine";
import { getDayLabel } from "@/shared/constants/dateLabels";
import { formatDateToYmd } from "@/shared/hooks/formatDate";
import { Stack, Text } from "@/shared/ui/primitives";
import { useSortable } from "@dnd-kit/sortable";
import { HiDotsHorizontal } from "react-icons/hi";
import { RiCheckboxBlankFill } from "react-icons/ri";
import { CSS } from "@dnd-kit/utilities";

interface RoutineItemProps {
  routine: Routine;
  onClickMore: () => void;
}

/**
 * 개별 루틴 아이템 컴포넌트
 */
export const RoutineItem = ({ routine, onClickMore }: RoutineItemProps) => {
  const today = formatDateToYmd(new Date());
  const isEnded = Boolean(routine.endDate && routine.endDate < today);

  // dnd-kit sortable hook
  // → 드래그 대상 등록 및 상태/이벤트 제공
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id });

  // 드래그 이동 시 적용되는 transform 스타일
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef} // 드래그 대상 DOM 연결
      style={style} // 위치 이동 애니메이션 적용
      {...attributes} // 접근성 속성
      {...listeners} // 드래그 이벤트 바인딩
      className={`w-full flex flex-col
        cursor-grab 
        transition-all duration-200 ease-out
        ${isDragging ? "bg-surface-raised shadow-[var(--shadow-drag)] scale-[1.01]" : "hover:bg-surface-hover"}
      `}
    >
      <div className="flex justify-between items-center w-full ">
        <Stack gap={2} direction="row" align="center">
          <RiCheckboxBlankFill size={10} />
          <div className="flex flex-col">
            {/* 루틴 제목 */}
            <Stack gap={2} direction="row" align="center">
              {isEnded && (
                <Text variant="bodySm" tone="muted" className="font-bold">
                  [종료]
                </Text>
              )}
              <Text variant="body" className="font-bold">
                {routine.title}
              </Text>
            </Stack>

            {/* 반복 요일 표시 */}
            <Stack gap={2} direction="row">
              {routine.days
                .sort((a, b) => a - b)
                .map((day, index) => (
                  <Text
                    variant="bodySm"
                    key={index}
                    className="text-content-muted"
                  >
                    {getDayLabel(day)}
                  </Text>
                ))}
            </Stack>
          </div>
        </Stack>

        {/* 더보기 버튼 (상세/수정 모달 트리거) */}
        <button onClick={onClickMore} className="pressable">
          <HiDotsHorizontal color="var(--color-content-muted)" size={20} />
        </button>
      </div>
    </div>
  );
};

import type { Routine } from "@/shared/api/routine";
import { useSortableItem } from "@/shared/ui/useSortableItem";
import { getDayLabel } from "@/shared/constants/dateLabels";
import { formatDateToYmd } from "@/shared/utils/formatDate";
import { Stack, Text } from "@/shared/ui/primitives";
import { HiDotsHorizontal } from "react-icons/hi";
import { RiCheckboxBlankFill } from "react-icons/ri";

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

  const { isDragging, dragHandleProps } = useSortableItem(routine.id);

  return (
    <div
      {...dragHandleProps}
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

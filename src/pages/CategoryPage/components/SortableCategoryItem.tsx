import { Text } from "@/shared/ui/primitives";
import type { Category } from "@/shared/api/category";
import { getCategoryColor } from "@/shared/constants/colors";
import { HiDotsHorizontal } from "react-icons/hi";
import { useState } from "react";
import CategoryModal from "./CategoryModal";
import { formatTimestampToKoreanDate } from "@/shared/hooks/formatDate";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableCategoryItemProps {
  category: Category;
}

export const SortableCategoryItem = ({
  category,
}: SortableCategoryItemProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 저장된 hex 가 아니라 테마에 맞게 고른 색으로 그린다
  const color = getCategoryColor(category.color);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        w-full flex flex-col py-2
        cursor-grab 
        transition-all duration-200 ease-out
        ${isDragging ? "bg-surface-raised shadow-xl scale-[1.01]" : "hover:bg-surface-sunken"}
      `}
    >
      <div className="w-full  flex justify-between items-center">
        <div className="flex w-2/3 min-w-0 items-center">
          <Text
            style={{ color }}
            className="font-bold min-w-0 flex-1 truncate no-select"
          >
            {category.name}
          </Text>
          {category.status === "ENDED" && (
            <Text variant="caption" tone="muted" className="flex-3">
              {`${formatTimestampToKoreanDate(category.createdAt)} ~ ${formatTimestampToKoreanDate(
                category.endedAt,
              )}`}
            </Text>
          )}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          aria-label={`${category.name} 카테고리 메뉴 열기`}
          className="pressable shrink-0"
        >
          <HiDotsHorizontal color="var(--color-content-muted)" size={20} />
        </button>
      </div>

      {isOpen && (
        <CategoryModal
          mode="VIEW"
          category={category}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

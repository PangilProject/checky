import { Text1, Text3 } from "@/shared/ui/Text";
import type { Category } from "@/shared/api/category";
import { COLOR_CLASS_TEXT_MAP } from "@/shared/constants/color";
import { HiDotsHorizontal } from "react-icons/hi";
import { Space2 } from "@/shared/ui/Space";
import { useState } from "react";
import CategoryModal from "./CategoryModal";
import { formatDate } from "@/shared/hooks/formatDate";
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

  const textColor = COLOR_CLASS_TEXT_MAP[category.color];
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        w-full flex flex-col
        cursor-grab 
        transition-all duration-200 ease-out
        ${isDragging ? "bg-white shadow-xl scale-[1.01]" : "hover:bg-gray-100"}
      `}
    >
      <Space2 direction="mb" />
      <div className="w-full  flex justify-between items-center">
        <div className="flex w-2/3 items-center">
          <Text3
            text={category.name}
            className={`${textColor} font-bold flex-1 no-select`}
          />
          {category.status === "ENDED" && (
            <Text1
              text={`${formatDate(category.createdAt)} ~ ${formatDate(
                category.endedAt
              )}`}
              className="flex-3 text-[#8E8E93]"
            />
          )}
        </div>
        <button onClick={() => setIsOpen(true)} className="pressable">
          <HiDotsHorizontal color="#8E8E93" size={20} />
        </button>
      </div>
      <Space2 direction="mb" />

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

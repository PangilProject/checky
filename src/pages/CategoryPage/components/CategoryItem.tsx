import { Text1, Text3 } from "@/shared/ui/Text";
import type { Category } from "./CategorySection";
import { COLOR_CLASS_MAP } from "@/shared/constants/color";
import { HiDotsHorizontal } from "react-icons/hi";
import { Space2 } from "@/shared/ui/Space";
import { useState } from "react";
import CategoryModal from "./CategoryModal";
import { formatDate } from "@/shared/hooks/formatDate";

interface CategoryItemProps {
  category: Category;
}

export const CategoryItem = ({ category }: CategoryItemProps) => {
  const textColor = COLOR_CLASS_MAP[category.color];
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full flex flex-col hover:bg-gray-100">
      <Space2 direction="mb" />
      <div className="w-full  flex justify-between items-center">
        <div className="flex w-2/3 items-center">
          <Text3
            text={category.name}
            className={`${textColor} font-bold flex-1`}
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

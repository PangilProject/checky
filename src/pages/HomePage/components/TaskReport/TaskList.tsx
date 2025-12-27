import { getCategories, type Category } from "@/shared/api/category";
import {
  COLOR_CLASS_BORDER_MAP,
  COLOR_CLASS_TEXT_MAP,
} from "@/shared/constants/color";
import { useAuth } from "@/shared/hooks/useAuth";
import { Space2, Space20 } from "@/shared/ui/Space";
import { Text3, Text4 } from "@/shared/ui/Text";
import { useEffect, useRef, useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { LongBlackButton } from "@/shared/ui/Button";

export const TaskListSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const status = "ACTIVE";
  useEffect(() => {
    if (!user) return;

    const unsubscribe = getCategories({
      userId: user.uid,
      status,
      onChange: setCategories,
    });

    return () => unsubscribe();
  }, [user, status]);

  return (
    <div className="flex flex-col w-full">
      {categories.map((category) => (
        <CategoryItem
          categoryName={category.name}
          categoryColor={category.color}
        />
      ))}
    </div>
  );
};

interface CategoryItemProps {
  categoryName: string;
  categoryColor: string;
}
const CategoryItem = ({ categoryName, categoryColor }: CategoryItemProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  return (
    <div className="">
      <AddCategory
        categoryName={categoryName}
        categoryColor={categoryColor}
        onClick={() => setIsAddOpen(true)}
      />
      <TaskList categoryColor={categoryColor} />
      <Space2 direction="mb" />
      {isAddOpen && (
        <AddTaskInput
          categoryColor={categoryColor}
          onBlurClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  );
};

interface AddCategoryProps extends CategoryItemProps {
  onClick: () => void;
}
const AddCategory = ({
  categoryName,
  categoryColor,
  onClick,
}: AddCategoryProps) => {
  const textColor = COLOR_CLASS_TEXT_MAP[categoryColor];
  return (
    <div className="flex gap-2 items-center" onClick={onClick}>
      <Text4 text={categoryName} className={`${textColor} font-bold`} />
      <FaCirclePlus size={15} color={categoryColor} />
      <Space20 direction="mb" />
    </div>
  );
};

const TaskList = ({ categoryColor }: { categoryColor: string }) => {
  return (
    <div className="flex gap-2">
      <FaCheckCircle size={20} color={categoryColor} />
      <Text3 text="밥 먹기" />
    </div>
  );
};

interface AddTaskInputProps {
  categoryColor: string;
  onBlurClose: () => void;
}

const AddTaskInput = ({ categoryColor, onBlurClose }: AddTaskInputProps) => {
  const [taskInput, setTaskInput] = useState("");
  const borderColor = COLOR_CLASS_BORDER_MAP[categoryColor];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-end gap-2">
      <LuCircleDashed size={26} color={categoryColor} />
      <input
        ref={inputRef}
        className={`outline-none border-b w-full ${borderColor} `}
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        onBlur={onBlurClose}
      />
      <LongBlackButton
        text="추가"
        className="text-[12px]"
        width="w-15"
        height="h-7"
      />
    </div>
  );
};

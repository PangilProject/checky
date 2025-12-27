import { getCategories, type Category } from "@/shared/api/category";
import { COLOR_CLASS_MAP } from "@/shared/constants/color";
import { useAuth } from "@/shared/hooks/useAuth";
import { Space20 } from "@/shared/ui/Space";
import { Text4 } from "@/shared/ui/Text";
import { useEffect, useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";

export const TaskList = () => {
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
        <TaskItem categoryName={category.name} categoryColor={category.color} />
      ))}
    </div>
  );
};

interface TaskItemProps {
  categoryName: string;
  categoryColor: string;
}
const TaskItem = ({ categoryName, categoryColor }: TaskItemProps) => {
  const textColor = COLOR_CLASS_MAP[categoryColor];
  return (
    <div className="flex gap-2 items-center">
      <Text4 text={categoryName} className={`${textColor} font-bold`} />
      <FaCirclePlus size={15} color={categoryColor} />
      <Space20 direction="mb" />
    </div>
  );
};

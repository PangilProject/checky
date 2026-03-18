import { FaCirclePlus } from "react-icons/fa6";
import { COLOR_CLASS_TEXT_MAP } from "@/shared/constants/colors";
import { Space10 } from "@/shared/ui/Space";
import { Text4 } from "@/shared/ui/Text";

interface AddCategoryProps {
  categoryName: string;
  categoryColor: string;
  onClick: () => void;
}

export const AddCategory = ({
  categoryName,
  categoryColor,
  onClick,
}: AddCategoryProps) => {
  const textColor = COLOR_CLASS_TEXT_MAP[categoryColor];
  return (
    <div className="flex gap-2 items-center" onClick={onClick}>
      <Text4 text={categoryName} className={`${textColor} font-bold`} />
      <FaCirclePlus size={15} color={categoryColor} className="pressable" />
      <Space10 direction="mb" />
    </div>
  );
};

import { FaCirclePlus } from "react-icons/fa6";
import { COLOR_CLASS_TEXT_MAP } from "@/shared/constants/colors";
import { Space10 } from "@/shared/ui/Space";
import { Text4 } from "@/shared/ui/Text";

interface AddCategoryProps {
  categoryName: string;
  categoryColor: string;
  /** 새 할 일을 넣을 수 있는지. 종료한 분류는 false 다. */
  canAdd?: boolean;
  onClick: () => void;
}

export const AddCategory = ({
  categoryName,
  categoryColor,
  canAdd = true,
  onClick,
}: AddCategoryProps) => {
  const textColor = COLOR_CLASS_TEXT_MAP[categoryColor];
  return (
    <div
      className="flex gap-2 items-center"
      onClick={canAdd ? onClick : undefined}
    >
      <Text4 text={categoryName} className={`${textColor} font-bold`} />
      {canAdd ? (
        <FaCirclePlus size={15} color={categoryColor} className="pressable" />
      ) : (
        // 왜 더할 수 없는지 알 수 있도록 상태를 적어 둔다
        <Text4 text="종료됨" className="text-gray-400" />
      )}
      <Space10 direction="mb" />
    </div>
  );
};

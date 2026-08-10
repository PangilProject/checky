import { FaCirclePlus } from "react-icons/fa6";
import { getCategoryColor } from "@/shared/constants/colors";
import { Stack, Text } from "@/shared/ui/primitives";

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
  // 저장된 hex 가 아니라 테마에 맞게 고른 색으로 그린다
  const color = getCategoryColor(categoryColor);
  return (
    <Stack
      gap={2}
      direction="row"
      align="center"
      className="min-h-10" // 여백을 넣던 빈 요소가 만들던 줄 높이를 그대로 유지한다

      onClick={canAdd ? onClick : undefined}
    >
      <Text variant="title" style={{ color }}>
        {categoryName}
      </Text>
      {canAdd ? (
        <FaCirclePlus size={15} color={color} className="pressable" />
      ) : (
        // 왜 더할 수 없는지 알 수 있도록 상태를 적어 둔다
        <Text variant="title" tone="muted">
          종료됨
        </Text>
      )}
    </Stack>
  );
};

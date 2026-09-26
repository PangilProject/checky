/**
 * 랜딩 필름에 나오는 분류 머리의 겉모습.
 * 클래스는 TaskReport/components/AddCategory.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import { FaCirclePlus } from "react-icons/fa6";
import { Text } from "@/shared/ui/primitives";
import { getCategoryTextColor } from "@/shared/constants/colors";

export const CategoryHeader = ({
  name,
  color,
  count,
}: {
  name: string;
  color: string;
  count: string;
}) => {
  const tint = getCategoryTextColor(color);
  return (
    <div className="flex min-h-10 w-full items-center gap-2">
      <Text variant="title" as="p" style={{ color: tint }}>
        {name}
      </Text>
      <FaCirclePlus size={15} color={tint} />
      <Text variant="bodySm" tone="muted" className="ml-auto" as="span">
        <span data-count="">{count}</span>
      </Text>
    </div>
  );
};

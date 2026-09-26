/**
 * 랜딩 필름에 나오는 할 일·루틴 체크 아이콘의 겉모습.
 * 클래스는 TaskItemsList.tsx, RoutineTable.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { GoDash } from "react-icons/go";
import { cn } from "@/shared/ui/primitives";
import { getCategoryTextColor } from "@/shared/constants/colors";

/**
 * 할 일·루틴의 체크 아이콘 (TaskItemsList, RoutineTable).
 * 두 상태를 겹쳐 두고 data-checked 로 고른다. 필름은 React 를 거치지 않고
 * 이 속성만 바꿔 상태를 뒤집는다.
 */
export const CheckIcon = ({
  color,
  checked = false,
  size = 20,
  className,
}: {
  color: string;
  checked?: boolean;
  size?: number;
  className?: string;
}) => {
  const tint = getCategoryTextColor(color);
  return (
    <span
      data-check-icon=""
      data-checked={checked}
      className={cn("group relative block shrink-0", className)}
      style={{ width: size, height: size, color: tint }}
    >
      <LuCircleDashed
        size={size}
        className="absolute inset-0 transition-opacity duration-200 group-data-[checked=true]:opacity-0"
      />
      <FaCheckCircle
        size={size}
        className="absolute inset-0 opacity-0 transition-opacity duration-200 group-data-[checked=true]:opacity-100"
      />
    </span>
  );
};

/** 반복 요일이 아닌 칸 (RoutineTable) */
export const DashIcon = () => (
  <GoDash size={20} color="var(--color-content-muted)" className="block" />
);

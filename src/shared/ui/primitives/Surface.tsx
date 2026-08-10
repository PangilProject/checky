import type { ElementType, ReactNode } from "react";
import { cn } from "../cn";

/**
 * 면.
 *
 * 카드·모달·비활성 영역처럼 바탕색을 가지는 덩어리를 담당한다.
 * 배경과 테두리를 한 곳에서 정해 두면, 테마가 바뀔 때 손댈 곳이 여기뿐이다.
 */

/** base: 페이지 바탕 / raised: 떠 있는 면 / sunken: 눌린 면 */
const LEVEL = {
  base: "bg-surface",
  raised: "bg-surface-raised",
  sunken: "bg-surface-sunken",
} as const;

const PADDING = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const;

const RADIUS = {
  none: "",
  md: "rounded-md",
  lg: "rounded-xl",
  full: "rounded-full",
} as const;

interface SurfaceProps {
  level?: keyof typeof LEVEL;
  padding?: keyof typeof PADDING;
  radius?: keyof typeof RADIUS;
  bordered?: boolean;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

export const Surface = ({
  level = "raised",
  padding = "none",
  radius = "none",
  bordered = false,
  as,
  className,
  children,
}: SurfaceProps) => {
  const Tag = as ?? "div";
  return (
    <Tag
      className={cn(
        LEVEL[level],
        PADDING[padding],
        RADIUS[radius],
        bordered && "border border-line",
        className,
      )}
    >
      {children}
    </Tag>
  );
};

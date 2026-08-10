import type { ElementType, HTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "../cn";

/**
 * 세로·가로로 늘어놓기.
 *
 * 여백을 <Space4 /> 같은 빈 요소로 끼워 넣으면 의미 없는 DOM 노드가 계속 늘고,
 * 항목을 지울 때 짝지어진 여백만 남기 쉽다. 간격은 부모가 gap 으로 소유한다.
 */

/**
 * 쓸 수 있는 간격.
 *
 * Tailwind 는 gap-5 나 gap-7 도 만들어 주지만, 고를 수 있는 값이 많을수록
 * 화면마다 간격이 조금씩 어긋난다. 여기 적힌 것만 쓴다.
 */
const GAP = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  20: "gap-20",
  24: "gap-24",
} as const;

const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

interface StackProps extends HTMLAttributes<HTMLElement> {
  direction?: "row" | "col";
  gap?: keyof typeof GAP;
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
  as?: ElementType;
  /** 드래그 라이브러리처럼 실제 요소를 잡아야 하는 곳을 위한 통로 */
  ref?: Ref<HTMLElement>;
  className?: string;
  children: ReactNode;
}

export const Stack = ({
  direction = "col",
  gap = 4,
  align,
  justify,
  wrap = false,
  as,
  className,
  children,
  ...rest
}: StackProps) => {
  const Tag = as ?? "div";
  return (
    <Tag
      {...rest}
      className={cn(
        "flex",
        direction === "col" ? "flex-col" : "flex-row",
        GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && "flex-wrap",
        className,
      )}
    >
      {children}
    </Tag>
  );
};

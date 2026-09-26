import type { CSSProperties } from "react";
import { cn } from "@/shared/ui/primitives";
import { DEMO_CATEGORIES, type DemoItem } from "../../constants/demoData";
import { CheckIcon } from "../AppMock/CheckIcon";
import { TaskRowTitle } from "../AppMock/TaskRowTitle";
import { Anchor } from "./FrameLayout";

/** 무대 위 한 점. 좁은 화면(sm)과 넓은 화면(md)의 가로·세로 위치를 % 로 적는다 */
export interface ScatterPosition {
  sm: readonly [number, number];
  md: readonly [number, number];
}

/**
 * 정리되지 않은 채 흩어진 할 일 한 줄.
 * 아이콘과 제목을 따로 재는 이유는, 정리되는 장면에서 루틴의 아이콘만 요일 칸으로 옮겨 가기 때문이다.
 */
export const ScatteredRow = ({
  item,
  position,
  iconSize = 20,
  checked = false,
  pinIcon = false,
  className,
  titleClassName,
}: {
  item: DemoItem;
  position: ScatterPosition;
  iconSize?: number;
  checked?: boolean;
  /** 줄 가운데가 아니라 아이콘을 그 점에 둔다 (오프닝의 빈 체크 하나) */
  pinIcon?: boolean;
  className?: string;
  titleClassName?: string;
}) => (
  <div
    className={cn(
      "absolute flex -translate-y-1/2 items-center gap-2",
      !pinIcon && "-translate-x-1/2",
      "top-(--y-sm) left-(--x-sm) md:top-(--y-md) md:left-(--x-md)",
      className,
    )}
    style={
      {
        "--x-sm": `${position.sm[0]}%`,
        "--y-sm": `${position.sm[1]}%`,
        "--x-md": `${position.md[0]}%`,
        "--y-md": `${position.md[1]}%`,
        // Tailwind 의 translate 는 두 변수로 합쳐지므로, 세로 이동은 두고 가로만 바꾼다
        ...(pinIcon && { "--tw-translate-x": `${-iconSize / 2}px` }),
      } as CSSProperties
    }
  >
    <Anchor id={`icon:${item.id}`}>
      <CheckIcon color={DEMO_CATEGORIES.inbox.color} size={iconSize} checked={checked} />
    </Anchor>
    <Anchor id={`title:${item.id}`}>
      <TaskRowTitle className={titleClassName}>{item.title}</TaskRowTitle>
    </Anchor>
  </div>
);

import type { ReactNode } from "react";
import { cn } from "@/shared/ui/primitives";
import { ARM_BOX } from "../constants/checkShape";
import { LogoImage } from "./AppMock/Logo";

/**
 * Checky 캐릭터.
 *
 * 지금 가진 그림은 몸과 팔이 붙은 PNG 한 장뿐이라 팔만 따로 움직이거나 눈을 깜빡일 수 없다.
 * 그래서 팔 자리에는 이야기의 체크(✓)를 겹쳐 그리고, 캐릭터 자체는 그림 그대로 둔다.
 * 캐릭터를 새로 그리지 않기 위한 선택이다.
 *
 * TODO(asset): 몸·팔·눈을 나눈 SVG 가 준비되면 이 컴포넌트만 바꾼다.
 *   - 팔: 지금의 ARM_BOX 자리에 CHECK_POINTS 와 같은 세 점으로 그린 path
 *   - 눈: 깜빡임용으로 따로 둔 두 개의 타원
 *   그때는 armSlot 에 겹친 체크 대신 그림의 팔을 직접 움직인다.
 */
export const CheckyCharacter = ({
  className,
  armSlot,
}: {
  className?: string;
  /** 팔 자리에 겹쳐 둘 것 (필름이 위치를 재는 표식 등) */
  armSlot?: ReactNode;
}) => (
  <div className={cn("relative aspect-square", className)}>
    <LogoImage shape="round" />
    {armSlot && (
      <div
        className="absolute"
        style={{
          left: `${ARM_BOX.left * 100}%`,
          top: `${ARM_BOX.top * 100}%`,
          width: `${ARM_BOX.size * 100}%`,
          height: `${ARM_BOX.size * 100}%`,
        }}
      >
        {armSlot}
      </div>
    )}
  </div>
);

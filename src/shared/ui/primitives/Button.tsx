import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/**
 * 버튼.
 *
 * 색과 채움 방식을 이름에 박으면(NormalRedUnFillButton) 조합 수만큼 컴포넌트가 늘고,
 * "빨강"이 무엇을 뜻하는지는 어디에도 적히지 않는다.
 * 여기서는 채움 방식(variant)과 의미(tone)를 나눠 받는다.
 */

/** 의미. 색이 아니라 역할이다. */
const TONE = {
  neutral: {
    fill: "bg-primary text-on-primary",
    outline: "border border-line-strong text-content",
    ghost: "text-content hover:bg-surface-hover",
  },
  danger: {
    fill: "bg-danger text-on-danger",
    outline: "border border-danger text-danger",
    ghost: "text-danger hover:bg-surface-hover",
  },
  accent: {
    fill: "bg-accent text-on-accent",
    outline: "border border-accent text-accent",
    ghost: "text-accent hover:bg-surface-hover",
  },
} as const;

const SIZE = {
  sm: "px-3 py-0.5 text-sm",
  md: "px-4 py-1 text-base",
  lg: "px-6 py-2 text-lg",
  /** 크기를 호출부가 직접 정하는 경우 (고정 폭 버튼 등) */
  none: "",
} as const;

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  variant?: "fill" | "outline" | "ghost";
  tone?: keyof typeof TONE;
  size?: keyof typeof SIZE;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export const Button = ({
  variant = "fill",
  tone = "neutral",
  size = "md",
  fullWidth = false,
  className,
  disabled = false,
  // 폼 안에서 제출 버튼으로도 쓸 수 있도록 열어 두되, 기본은 단순 버튼으로 둔다
  type = "button",
  children,
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      className={cn(
        "box-border rounded-md font-bold transition",
        // 키보드로 옮겨 다닐 때 지금 어디에 있는지 보이게 한다.
        // 마우스로 누를 때는 나타나지 않도록 focus-visible 을 쓴다.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        TONE[tone][variant],
        SIZE[size],
        fullWidth && "w-full",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "pressable hover:opacity-80",
        className,
      )}
    >
      {children}
    </button>
  );
};

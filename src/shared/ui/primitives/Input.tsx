import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from "react";
import { cn } from "../cn";

/**
 * 입력창.
 *
 * 화면마다 테두리 색과 글자 크기가 갈리고, 포커스가 어디에 있는지
 * 보이지 않는 곳이 있어 여기서 한 벌로 정한다.
 *
 * 글자 크기를 16px 아래로 두지 않는다.
 * iOS 사파리는 그보다 작은 입력창에 포커스가 가면 화면을 확대해 버린다.
 */

/** underline: 한 줄 입력 / box: 테두리를 두른 상자 */
const VARIANT = {
  underline: "border-0 border-b border-content-subtle focus:border-accent",
  box: "rounded-md border border-line p-2 focus:border-accent",
} as const;

const BASE = cn(
  "w-full bg-transparent text-base outline-none transition-colors",
  // 한글 조합 중 글꼴이 흔들리지 않도록 입력창 전용 글꼴을 쓴다
  "ime-fallback",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "placeholder:text-content-subtle",
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: keyof typeof VARIANT;
  /** 열자마자 포커스를 주는 곳처럼 실제 요소를 잡아야 하는 경우 */
  ref?: Ref<HTMLInputElement>;
}

export const Input = ({
  variant = "underline",
  className,
  ...rest
}: InputProps) => (
  <input {...rest} className={cn(BASE, VARIANT[variant], className)} />
);

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: keyof typeof VARIANT;
  ref?: Ref<HTMLTextAreaElement>;
}

export const TextArea = ({
  variant = "box",
  className,
  ...rest
}: TextAreaProps) => (
  <textarea {...rest} className={cn(BASE, VARIANT[variant], className)} />
);

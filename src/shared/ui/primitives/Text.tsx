import type { ElementType, ReactNode } from "react";
import { cn } from "../cn";

/**
 * 글자.
 *
 * 크기 번호(Text1~Text8) 대신 역할로 고른다.
 * 번호는 "얼마나 큰가"만 말해 주므로 화면마다 제목 크기가 갈리지만,
 * 역할로 고르면 제목은 어디서나 같은 제목이 된다.
 */

/** 글자 크기·굵기 (역할별로 한 벌씩 고정) */
const VARIANT = {
  display: "text-3xl font-bold",
  /** 모달 제목 */
  heading: "text-xl font-bold",
  /** 페이지 제목 */
  title: "text-lg font-bold",
  body: "text-base",
  bodySm: "text-sm",
  caption: "text-xs",
} as const;

/** 글자색. 배경이 아니라 의미로 고른다. */
const TONE = {
  default: "text-content",
  muted: "text-content-muted",
  subtle: "text-content-subtle",
  /** 어두운 면 위에 얹는 글자 */
  inverse: "text-content-inverse",
  danger: "text-danger",
  accent: "text-accent",
  success: "text-success",
} as const;

/** 역할에 어울리는 기본 태그. as 로 바꿀 수 있다. */
const DEFAULT_TAG: Record<keyof typeof VARIANT, ElementType> = {
  display: "h1",
  heading: "h2",
  title: "h3",
  body: "p",
  bodySm: "p",
  caption: "span",
};

interface TextProps {
  variant?: keyof typeof VARIANT;
  tone?: keyof typeof TONE;
  /** 태그를 직접 정한다 (제목처럼 보이지만 문서 구조상 제목이 아닐 때 등) */
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export const Text = ({
  variant = "body",
  tone = "default",
  as,
  className,
  children,
}: TextProps) => {
  const Tag = as ?? DEFAULT_TAG[variant];
  return (
    <Tag className={cn(VARIANT[variant], TONE[tone], className)}>
      {children}
    </Tag>
  );
};

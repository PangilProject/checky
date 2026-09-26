import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/shared/ui/primitives";
import { LogoImage, Wordmark } from "../AppMock/Logo";

/**
 * 장면의 정지 화면(프레임)이 놓이는 방식.
 *
 * film: 필름 무대 안에 겹쳐 그려 요소 위치를 재는 데 쓴다. 보이지 않는다.
 * static: 모션 줄이기를 켠 방문자에게 장면을 세로로 이어 보여 준다.
 * 두 방식이 같은 마크업을 쓰므로, 필름이 재는 위치와 정적 화면의 배치가 어긋나지 않는다.
 */
export type FrameMode = "film" | "static";

export type FrameId =
  | "pile"
  | "focus"
  | "reveal"
  | "list"
  | "split"
  | "calendar"
  | "stats"
  | "finale"
  | "ending";

/** 필름이 위치를 재는 표식. id 는 utils/buildTracks.ts 의 anchor 와 짝을 이룬다 */
export const Anchor = ({
  id,
  as: Tag = "div",
  className,
  style,
  children,
}: {
  id: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <Tag data-anchor={id} className={className} style={style}>
    {children}
  </Tag>
);

/** 장면 한 장. 필름에서는 무대를 가득 채우고, 정적 화면에서는 한 화면 높이를 차지한다 */
export const FrameLayout = ({
  id,
  mode,
  caption,
  children,
  className,
}: {
  id: FrameId;
  mode: FrameMode;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section
    data-frame={id}
    aria-hidden={mode === "film" ? true : undefined}
    className={cn(
      "flex flex-col",
      mode === "film" ? "absolute inset-0" : "relative min-h-svh py-10",
      className,
    )}
  >
    {children}
    {caption}
  </section>
);

/**
 * 앱 화면이 놓이는 칸. 필름에서는 무대 높이에 맞춰 줄어들 수 있도록 data-fit 을 단다.
 * 폭은 장면마다 실제 화면에서 그 섹션이 차지하는 정도로 고른다.
 */
export const ScreenArea = ({
  mode,
  className,
  children,
}: {
  mode: FrameMode;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "flex justify-center px-4",
      mode === "film" ? "min-h-0 flex-1 pt-16" : "pt-6",
    )}
  >
    <div data-fit={mode === "film" ? "" : undefined} className={cn("relative w-full origin-top", className)}>
      {children}
    </div>
  </div>
);

/** 장면의 핵심 문장. 한 장면에 하나만 둔다 */
export const Caption = ({
  id,
  mode,
  className,
  children,
}: {
  id: string;
  mode: FrameMode;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "shrink-0 px-6 text-center",
      mode === "film" ? "pt-4 pb-[8svh]" : "pt-8",
    )}
  >
    <Anchor id={`cap:${id}`} className={cn("inline-block", className)}>
      <CaptionText>{children}</CaptionText>
    </Anchor>
  </div>
);

export const CaptionText = ({ children }: { children: ReactNode }) => (
  // 낮은 화면(가로로 든 휴대폰)에서는 문장이 앱 화면을 밀어내지 않도록 줄인다
  <p className="whitespace-pre-line text-2xl leading-snug font-bold break-keep md:text-4xl [@media(max-height:520px)]:text-xl">
    {children}
  </p>
);

/** 앱 머리의 로고와 워드마크 (Header 의 LogoSection) */
export const AppHeaderAnchors = () => (
  <div className="my-3 flex items-center gap-2 sm:my-4">
    <Anchor id="char" className="h-6 w-6 sm:h-8 sm:w-8">
      <LogoImage shape="plain" className="object-contain" />
    </Anchor>
    <Anchor id="mark">
      <Wordmark className="text-lg sm:text-2xl" />
    </Anchor>
  </div>
);

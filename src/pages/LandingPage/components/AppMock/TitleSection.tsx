/**
 * 랜딩 필름에 나오는 섹션 제목의 겉모습.
 * 클래스는 HomePage/components/TitleSection.tsx, AchievementReport/components/ModeToggle.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import type { ReactNode } from "react";
import { VscTriangleLeft, VscTriangleRight } from "react-icons/vsc";
import { Text } from "@/shared/ui/primitives";

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text variant="title" as="p" className="whitespace-nowrap">
    {children}
  </Text>
);

export const SectionSubTitle = ({ children }: { children: ReactNode }) => (
  <Text variant="bodySm" className="whitespace-nowrap">
    {children}
  </Text>
);

/**
 * 섹션 제목 오른쪽의 버튼 (TitleSection). 랜딩에서는 눌리지 않는 그림이다.
 * nav: 새로고침·오늘·이동 (할 일, 루틴, 캘린더) / mode: 주간·월간 전환·이동 (달성 현황)
 */
export const SectionControls = ({ variant = "nav" }: { variant?: "nav" | "mode" }) => (
  <div className="flex items-center gap-3 whitespace-nowrap" aria-hidden="true">
    {variant === "mode" ? (
      <ModeToggleView />
    ) : (
      <>
        {/* 320px 대 화면에서는 버튼 줄이 제목을 밀어내므로 새로고침을 뺀다 */}
        <span className="rounded-md bg-surface-hover px-3 py-1 text-sm max-[360px]:hidden">새로고침</span>
        <span className="rounded-md bg-surface-hover px-3 py-1 text-sm">오늘</span>
      </>
    )}
    <VscTriangleLeft size={20} />
    <VscTriangleRight size={20} />
  </div>
);

/** 달성 현황의 주간·월간 전환 (ModeToggle) */
export const ModeToggleView = () => (
  <span className="inline-flex rounded-lg bg-surface-hover p-0.5 text-sm">
    <span className="rounded-md px-2.5 py-0.5 text-content-muted">주간</span>
    <span className="rounded-md bg-surface px-2.5 py-0.5 font-bold text-content shadow-sm">
      월간
    </span>
  </span>
);

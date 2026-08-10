import type { ReactNode } from "react";
import { Button, Text } from "@/shared/ui/primitives";
import { useTheme } from "@/shared/hooks/useTheme";
import type { ThemeMode } from "@/shared/stores/themeStore";
import { COLORS, getCategoryColor } from "@/shared/constants/colors";

/**
 * 디자인 시스템 갤러리.
 *
 * 토큰과 프리미티브를 한 화면에 늘어놓아, 라이트/다크를 오가며
 * 대비가 무너지는 곳을 눈으로 잡아내기 위한 개발용 화면이다.
 * 라우터가 개발 빌드에서만 이 화면을 등록한다.
 */

/** 화면에서 확인할 배경 토큰. 클래스 문자열은 Tailwind 가 훑을 수 있게 그대로 적는다. */
const SURFACE_TOKENS = [
  { name: "surface", className: "bg-surface" },
  { name: "surface-raised", className: "bg-surface-raised" },
  { name: "surface-sunken", className: "bg-surface-sunken" },
  { name: "primary", className: "bg-primary" },
  { name: "accent", className: "bg-accent" },
  { name: "danger", className: "bg-danger" },
  { name: "success", className: "bg-success" },
] as const;

const SHADOW_TOKENS = [
  { name: "popover", className: "shadow-[var(--shadow-popover)]" },
  { name: "modal", className: "shadow-[var(--shadow-modal)]" },
  { name: "drag", className: "shadow-[var(--shadow-drag)]" },
] as const;

const TEXT_TONES = [
  "default",
  "muted",
  "subtle",
  "danger",
  "accent",
  "success",
] as const;

const TEXT_VARIANTS = [
  "display",
  "heading",
  "title",
  "body",
  "bodySm",
  "caption",
] as const;

const BUTTON_VARIANTS = ["fill", "outline", "ghost"] as const;
const BUTTON_TONES = ["neutral", "danger", "accent"] as const;
const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <Text variant="title">{title}</Text>
    {children}
  </section>
);

function UiGalleryPage() {
  const { mode, resolved, setMode } = useTheme();

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 p-6">
        <div className="flex flex-col gap-3">
          <Text variant="display">디자인 시스템</Text>
          <div className="flex flex-wrap items-center gap-2">
            {THEME_MODES.map((themeMode) => (
              <Button
                key={themeMode}
                size="sm"
                variant={mode === themeMode ? "fill" : "outline"}
                onClick={() => setMode(themeMode)}
              >
                {themeMode}
              </Button>
            ))}
            <Text variant="bodySm" tone="muted">
              지금 그려지는 테마: {resolved}
            </Text>
          </div>
        </div>

        <Section title="배경 토큰">
          <div className="flex flex-wrap gap-3">
            {SURFACE_TOKENS.map(({ name, className }) => (
              <div key={name} className="flex w-32 flex-col gap-1">
                <div
                  className={`h-14 rounded-md border border-line ${className}`}
                />
                <Text variant="caption" tone="muted">
                  {name}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section title="그림자">
          <Text variant="bodySm" tone="muted">
            어두운 배경에서는 검은 그림자가 보이지 않으므로, 다크에서 값이
            바뀐다. 떠 있어 보이는지 확인한다.
          </Text>
          <div className="flex flex-wrap gap-6 py-2">
            {SHADOW_TOKENS.map(({ name, className }) => (
              <div key={name} className="flex w-32 flex-col gap-2">
                <div
                  className={`h-16 rounded-lg bg-surface-raised ${className}`}
                />
                <Text variant="caption" tone="muted">
                  {name}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section title="카테고리 색">
          <Text variant="bodySm" tone="muted">
            저장된 값은 그대로 두고 그릴 때만 바꾼다. 다크에서 검정이 밝게
            뒤집히는지, 노랑이 눈부시지 않은지 본다.
          </Text>
          <div className="flex flex-wrap gap-3">
            {COLORS.map(({ name, value }) => (
              <div key={name} className="flex w-16 flex-col items-center gap-1">
                <div
                  className="h-10 w-10 rounded-full border border-line"
                  style={{ backgroundColor: getCategoryColor(value) }}
                />
                <Text
                  variant="caption"
                  style={{ color: getCategoryColor(value) }}
                >
                  {name}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section title="글자 크기">
          <div className="flex flex-col gap-2">
            {TEXT_VARIANTS.map((variant) => (
              <Text key={variant} variant={variant} as="p">
                {variant} — 어제보다 더 나은 오늘
              </Text>
            ))}
          </div>
        </Section>

        <Section title="글자색">
          <div className="flex flex-col gap-1">
            {TEXT_TONES.map((tone) => (
              <Text key={tone} tone={tone}>
                {tone} — 어제보다 더 나은 오늘
              </Text>
            ))}
            <div className="rounded-md bg-surface-sunken p-3">
              <Text tone="muted">
                inverse 는 어두운 면 위에서만 쓴다 →{" "}
                <span className="rounded bg-primary px-2 py-1 text-on-primary">
                  on-primary
                </span>
              </Text>
            </div>
          </div>
        </Section>

        <Section title="버튼">
          <div className="flex flex-col gap-3">
            {BUTTON_VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-2">
                <Text variant="bodySm" tone="muted" className="w-16">
                  {variant}
                </Text>
                {BUTTON_TONES.map((tone) => (
                  <Button key={tone} variant={variant} tone={tone}>
                    {tone}
                  </Button>
                ))}
                <Button variant={variant} disabled>
                  disabled
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="bodySm" tone="muted" className="w-16">
                크기
              </Text>
              <Button size="sm">sm</Button>
              <Button size="md">md</Button>
              <Button size="lg">lg</Button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default UiGalleryPage;

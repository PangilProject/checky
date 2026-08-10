import type { ReactNode } from "react";
import {
  Button,
  Input,
  Stack,
  Surface,
  Text,
  TextArea,
} from "@/shared/ui/primitives";
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
  { name: "surface-hover", className: "bg-surface-hover" },
  { name: "surface-selected", className: "bg-surface-selected" },
  { name: "primary", className: "bg-primary" },
  { name: "accent", className: "bg-accent" },
  { name: "danger", className: "bg-danger" },
  { name: "warning", className: "bg-warning" },
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
  "warning",
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
        <Stack gap={3} direction="col">
          <Text variant="display">디자인 시스템</Text>
          <Stack gap={2} direction="row" wrap align="center">
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
          </Stack>
        </Stack>

        <Section title="배경 토큰">
          <Stack gap={3} direction="row" wrap>
            {SURFACE_TOKENS.map(({ name, className }) => (
              <Stack gap={1} direction="col" className="w-32" key={name}>
                <div
                  className={`h-14 rounded-md border border-line ${className}`}
                />
                <Text variant="caption" tone="muted">
                  {name}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>

        <Section title="그림자">
          <Text variant="bodySm" tone="muted">
            어두운 배경에서는 검은 그림자가 보이지 않으므로, 다크에서 값이
            바뀐다. 떠 있어 보이는지 확인한다.
          </Text>
          <Stack gap={6} direction="row" wrap className="py-2">
            {SHADOW_TOKENS.map(({ name, className }) => (
              <Stack gap={2} direction="col" className="w-32" key={name}>
                <div
                  className={`h-16 rounded-lg bg-surface-raised ${className}`}
                />
                <Text variant="caption" tone="muted">
                  {name}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>

        <Section title="카테고리 색">
          <Text variant="bodySm" tone="muted">
            저장된 값은 그대로 두고 그릴 때만 바꾼다. 다크에서 검정이 밝게
            뒤집히는지, 노랑이 눈부시지 않은지 본다.
          </Text>
          <Stack gap={3} direction="row" wrap>
            {COLORS.map(({ name, value }) => (
              <Stack
                gap={1}
                direction="col"
                align="center"
                className="w-16"
                key={name}
              >
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
              </Stack>
            ))}
          </Stack>
        </Section>

        <Section title="글자 크기">
          <Stack gap={2} direction="col">
            {TEXT_VARIANTS.map((variant) => (
              <Text key={variant} variant={variant} as="p">
                {variant} — 어제보다 더 나은 오늘
              </Text>
            ))}
          </Stack>
        </Section>

        <Section title="글자색">
          <Stack gap={1} direction="col">
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
          </Stack>
        </Section>

        <Section title="버튼">
          <Stack gap={3} direction="col">
            {BUTTON_VARIANTS.map((variant) => (
              <Stack gap={2} direction="row" wrap align="center" key={variant}>
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
              </Stack>
            ))}
            <Stack gap={2} direction="row" wrap align="center">
              <Text variant="bodySm" tone="muted" className="w-16">
                크기
              </Text>
              <Button size="sm">sm</Button>
              <Button size="md">md</Button>
              <Button size="lg">lg</Button>
            </Stack>
          </Stack>
        </Section>

        <Section title="상태">
          <Text variant="bodySm" tone="muted">
            마우스를 올리고 눌러 본다. 다크에서도 hover 와 selected 가 서로,
            그리고 기본 상태와 구분되어야 한다. Tab 키로 옮겨 다니며 포커스 링도
            확인한다.
          </Text>
          <Stack gap={2} direction="col" className="max-w-sm">
            <div className="rounded-md bg-surface p-3">
              <Text variant="bodySm">default — surface</Text>
            </div>
            <div className="rounded-md bg-surface-hover p-3">
              <Text variant="bodySm">hover — surface-hover</Text>
            </div>
            <div className="rounded-md bg-surface-selected p-3">
              <Text variant="bodySm">selected — surface-selected</Text>
            </div>
            <div className="rounded-md bg-surface-sunken p-3">
              <Text variant="bodySm">sunken — 표 머리글처럼 눌린 면</Text>
            </div>
            <button
              type="button"
              className="rounded-md p-3 text-left hover:bg-surface-hover"
            >
              <Text variant="bodySm">직접 올려 보기 (hover)</Text>
            </button>
          </Stack>
        </Section>

        <Section title="주말 색">
          <Text variant="bodySm" tone="muted">
            달력의 관습이라 danger/accent 와 값은 비슷하지만 뜻이 다르다.
          </Text>
          <Stack gap={4} direction="row">
            <Text className="text-weekend-sun">일요일</Text>
            <Text className="text-weekend-sat">토요일</Text>
          </Stack>
        </Section>

        <Section title="입력">
          <Text variant="bodySm" tone="muted">
            눌러서 포커스가 어디에 있는지 보이는지 확인한다. 글자 크기는 16px
            아래로 내리지 않는다. iOS 는 그보다 작으면 화면을 확대한다.
          </Text>
          <Stack gap={4} direction="col" className="max-w-sm">
            <Input placeholder="한 줄 입력 (underline)" />
            <Input variant="box" placeholder="한 줄 입력 (box)" />
            <Input placeholder="비활성" disabled />
            <TextArea placeholder="여러 줄 입력" className="h-24 resize-none" />
          </Stack>
        </Section>

        <Section title="면">
          <Stack gap={3} direction="row" wrap>
            <Surface level="raised" padding="md" radius="lg" bordered>
              <Text variant="bodySm">raised + bordered</Text>
            </Surface>
            <Surface level="sunken" padding="md" radius="lg">
              <Text variant="bodySm">sunken</Text>
            </Surface>
          </Stack>
        </Section>
      </div>
    </div>
  );
}

export default UiGalleryPage;

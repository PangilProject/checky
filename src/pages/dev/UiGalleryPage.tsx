import { Button, Stack, Surface, Text } from "@/shared/ui/primitives";
import { useTheme } from "@/shared/hooks/useTheme";
import type { ThemeMode } from "@/shared/stores/themeStore";

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
  children: React.ReactNode;
}) => (
  <Stack gap={3} as="section">
    <Text variant="title">{title}</Text>
    {children}
  </Stack>
);

function UiGalleryPage() {
  const { mode, resolved, setMode } = useTheme();

  return (
    <Surface level="base" className="min-h-screen">
      <Stack gap={10} className="mx-auto max-w-3xl p-6">
        <Stack gap={3}>
          <Text variant="display">디자인 시스템</Text>
          <Stack direction="row" gap={2} align="center" wrap>
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
          <Stack direction="row" gap={3} wrap>
            {SURFACE_TOKENS.map(({ name, className }) => (
              <Stack key={name} gap={1} className="w-32">
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

        <Section title="글자 크기">
          <Stack gap={2}>
            {TEXT_VARIANTS.map((variant) => (
              <Text key={variant} variant={variant} as="p">
                {variant} — 어제보다 더 나은 오늘
              </Text>
            ))}
          </Stack>
        </Section>

        <Section title="글자색">
          <Stack gap={1}>
            {TEXT_TONES.map((tone) => (
              <Text key={tone} tone={tone}>
                {tone} — 어제보다 더 나은 오늘
              </Text>
            ))}
            <Surface level="sunken" padding="sm" radius="md">
              <Text tone="muted">
                inverse 는 어두운 면 위에서만 쓴다 →{" "}
                <span className="rounded bg-primary px-2 py-1 text-on-primary">
                  on-primary
                </span>
              </Text>
            </Surface>
          </Stack>
        </Section>

        <Section title="버튼">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <Stack key={variant} direction="row" gap={2} align="center" wrap>
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
            <Stack direction="row" gap={2} align="center" wrap>
              <Text variant="bodySm" tone="muted" className="w-16">
                크기
              </Text>
              <Button size="sm">sm</Button>
              <Button size="md">md</Button>
              <Button size="lg">lg</Button>
            </Stack>
          </Stack>
        </Section>

        <Section title="면">
          <Stack direction="row" gap={3} wrap>
            <Surface level="raised" padding="md" radius="lg" bordered>
              <Text variant="bodySm">raised + bordered</Text>
            </Surface>
            <Surface level="sunken" padding="md" radius="lg">
              <Text variant="bodySm">sunken</Text>
            </Surface>
          </Stack>
        </Section>
      </Stack>
    </Surface>
  );
}

export default UiGalleryPage;

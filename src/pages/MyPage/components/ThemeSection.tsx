import { Button, Stack, Text } from "@/shared/ui/primitives";
import { useTheme } from "@/shared/hooks/useTheme";
import type { ThemeMode } from "@/shared/stores/themeStore";

/**
 * 화면 테마 선택.
 *
 * "시스템"은 라이트/다크와 나란한 세 번째 선택지다.
 * OS 를 따라가겠다는 것도 사용자의 결정이므로 그대로 저장하고,
 * 이후 OS 가 바뀌면 화면도 따라 바뀐다.
 */

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "라이트" },
  { mode: "dark", label: "다크" },
  { mode: "system", label: "시스템" },
];

export const ThemeSection = () => {
  const { mode, setMode } = useTheme();

  return (
    <Stack gap={2}>
      <Text variant="bodySm" tone="muted">
        화면 테마
      </Text>
      <Stack direction="row" gap={2} wrap>
        {OPTIONS.map((option) => {
          const isSelected = mode === option.mode;
          return (
            <Button
              key={option.mode}
              size="sm"
              variant={isSelected ? "fill" : "outline"}
              aria-pressed={isSelected}
              onClick={() => setMode(option.mode)}
            >
              {option.label}
            </Button>
          );
        })}
      </Stack>
    </Stack>
  );
};

import { useEffect } from "react";
import {
  ensureThemeSubscription,
  setThemeMode,
  useThemeStore,
} from "@/shared/stores/themeStore";

/**
 * 공유 테마 상태를 읽고 바꾸는 훅.
 *
 * 화면에 칠해지는 색은 CSS 토큰이 담당하므로, 이 훅을 쓰는 쪽은
 * 설정 UI(무엇이 선택되어 있는지, 무엇으로 바꿀지)만 신경 쓰면 된다.
 */
export function useTheme() {
  useEffect(() => {
    ensureThemeSubscription();
  }, []);

  const mode = useThemeStore((state) => state.mode);
  const resolved = useThemeStore((state) => state.resolved);

  return { mode, resolved, setMode: setThemeMode };
}

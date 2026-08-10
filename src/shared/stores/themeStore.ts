import { create } from "zustand";

/**
 * @file themeStore.ts
 * @description 앱 전체가 공유하는 테마 상태.
 *
 * 색은 CSS 토큰이 전부 쥐고 있으므로, 여기서 하는 일은
 * <html> 에 .dark 를 붙이고 떼는 것뿐이다.
 */

/** 사용자가 고른 값. system 은 "OS 를 따라가겠다"는 선택이며 그 자체로 저장된다. */
export type ThemeMode = "light" | "dark" | "system";
/** 실제로 화면에 그려지는 결과 */
export type ResolvedTheme = "light" | "dark";

/** 첫 페인트 전에 테마를 적용하는 index.html 의 인라인 스크립트와 공유하는 키 */
const THEME_STORAGE_KEY = "checky:theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

/** 저장된 선택을 읽는다. 사파리 프라이빗 모드처럼 저장소 접근이 막힌 환경도 있으므로 실패를 흡수한다. */
const readStoredMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia(DARK_QUERY).matches ? "dark" : "light";

const resolve = (mode: ThemeMode): ResolvedTheme =>
  mode === "system" ? getSystemTheme() : mode;

/**
 * 주소창·상태바 색을 배경과 맞춘다.
 * 이 값이 흰색으로 남아 있으면 다크 화면 위에 흰 띠가 남는다.
 */
const syncBrowserChrome = (theme: ResolvedTheme) => {
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "dark" ? "#141414" : "#ffffff");
};

const applyToDocument = (theme: ResolvedTheme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  syncBrowserChrome(theme);
};

interface ThemeState {
  /** 사용자가 고른 값 (설정 화면이 보여주는 것) */
  mode: ThemeMode;
  /** 지금 그려지는 테마 (system 이면 OS 를 따라 바뀐다) */
  resolved: ResolvedTheme;
}

const initialMode = readStoredMode();

export const useThemeStore = create<ThemeState>(() => ({
  mode: initialMode,
  resolved: resolve(initialMode),
}));

export const setThemeMode = (mode: ThemeMode) => {
  const resolved = resolve(mode);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // 저장에 실패해도 이번 세션의 전환은 그대로 진행한다
  }

  applyToDocument(resolved);
  useThemeStore.setState({ mode, resolved });
};

/** OS 테마 구독은 앱 생애 동안 하나만 유지한다 */
let isSubscribed = false;

/**
 * OS 테마 변경을 따라간다.
 *
 * 인라인 스크립트가 이미 첫 페인트 전에 .dark 를 붙여 두었으므로
 * 여기서는 화면을 다시 칠하지 않고, 이후의 변경만 반영한다.
 */
export const ensureThemeSubscription = () => {
  if (isSubscribed) return;
  isSubscribed = true;

  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", () => {
    // 사용자가 light/dark 를 직접 골랐다면 OS 가 바뀌어도 그 선택을 지킨다
    if (useThemeStore.getState().mode !== "system") return;

    const resolved = getSystemTheme();
    applyToDocument(resolved);
    useThemeStore.setState({ resolved });
  });
};

import { defineConfig, devices } from "@playwright/test";

/**
 * E2E 테스트 설정.
 *
 * Firebase 에뮬레이터(auth, firestore)가 떠 있어야 한다. `npm run e2e` 가
 * firebase emulators:exec 로 감싸서 실행한다. 사용법은 e2e/README.md 에 있다.
 *
 * 앱은 `vite --mode e2e` 로 띄워 .env.e2e 의 demo 프로젝트를 쓰게 한다.
 * 평소 개발 서버(5173)와 겹치지 않게 포트를 따로 둔다.
 */
const PORT = 5174;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e/specs",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // 메뉴 다섯 개가 한 줄에 들어가야 하는 360px 대의 좁은 화면
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx vite --mode e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // 떠 있던 서버를 재사용하면 e2e 모드가 아닌 서버(실제 프로젝트)에 붙을 수 있어 항상 새로 띄운다
    reuseExistingServer: false,
  },
});

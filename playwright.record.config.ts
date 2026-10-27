import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/**
 * 클릭으로 테스트를 만드는 녹화 모드 설정. `npm run e2e:record` 가 쓴다.
 * 평소 테스트와 같은 앱·에뮬레이터·로그인을 쓰고, 브라우저를 띄운 채 끝없이 기다린다.
 */
export default defineConfig({
  ...base,
  testDir: "./e2e/record",
  timeout: 0,
  retries: 0,
  workers: 1,
  reporter: "list",
  projects: [{ name: "record", use: { ...base.projects?.[0]?.use, headless: false } }],
});

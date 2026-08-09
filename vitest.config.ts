import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * 기본 단위 테스트 설정.
 *
 * firestore.rules.test.ts 는 Firestore 에뮬레이터가 필요하므로 여기서 제외하고,
 * vitest.rules.config.ts + `npm run test:rules` 로 따로 돌린다.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});

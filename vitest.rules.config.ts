import { defineConfig } from "vitest/config";

/**
 * firestore.rules 보안 테스트 설정.
 *
 * Firestore 에뮬레이터가 떠 있어야 한다. `npm run test:rules` 가
 * firebase emulators:exec 로 감싸서 실행한다.
 */
export default defineConfig({
  test: {
    include: ["firestore.rules.test.ts"],
    // 규칙 평가와 에뮬레이터 기동이 느려 기본 타임아웃으로는 부족하다
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});

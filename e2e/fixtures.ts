import { test as base, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

type E2EWindow = Window & { __e2eSignIn: (uid: string) => Promise<void> };

type Fixtures = {
  /**
   * 이 테스트만 쓰는 새 사용자로 로그인하고 uid 를 돌려준다.
   *
   * 모든 데이터가 users/{uid} 아래에 있어, 사용자를 나누면 병렬로 돌려도 서로 보지 못한다.
   */
  signIn: () => Promise<string>;
  /** 콘솔 에러와 처리되지 않은 예외를 모은다. 하나라도 있으면 테스트를 실패시킨다. */
  pageErrors: string[];
};

export const test = base.extend<Fixtures>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      await use(errors);

      expect(errors, "화면에서 에러가 났습니다").toEqual([]);
    },
    { auto: true },
  ],

  signIn: async ({ page }, use) => {
    await use(async () => {
      const uid = `e2e-${randomUUID()}`;
      await page.goto("/login");
      await page.waitForFunction(() => "__e2eSignIn" in window);
      await page.evaluate(
        (id) => (window as unknown as E2EWindow).__e2eSignIn(id),
        uid,
      );
      return uid;
    });
  },
});

export { expect };

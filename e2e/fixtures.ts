import { test as base, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createSeeder, type Seeder } from "./seed";

type E2EWindow = Window & { __e2eSignIn: (googleId: string) => Promise<string> };

type Fixtures = {
  /**
   * 이 테스트만 쓰는 새 사용자로 로그인한다. 그 사용자에게 데이터를 넣는 seed 를 함께 돌려준다.
   *
   * 모든 데이터가 users/{uid} 아래에 있어, 사용자를 나누면 병렬로 돌려도 서로 보지 못한다.
   */
  signIn: () => Promise<{ uid: string; seed: Seeder }>;
  /** 콘솔 에러와 처리되지 않은 예외를 모은다. 하나라도 있으면 테스트를 실패시킨다. */
  pageErrors: string[];
  /**
   * 화면이 오늘로 볼 날짜(`YYYY-MM-DD`, 서울 시각). `test.use({ today })` 로 정한다.
   * 날짜에 따라 결과가 달라지는 화면을 언제 돌려도 같게 만든다.
   */
  today: string | null;
  fixedClock: void;
};

export const test = base.extend<Fixtures>({
  today: [null, { option: true }],

  fixedClock: [
    async ({ page, today }, use) => {
      if (today) await page.clock.setFixedTime(new Date(`${today}T10:00:00+09:00`));
      await use();
    },
    { auto: true },
  ],

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
      await page.goto("/login");
      await page.waitForFunction(() => "__e2eSignIn" in window);
      const uid = await page.evaluate(
        (googleId) => (window as unknown as E2EWindow).__e2eSignIn(googleId),
        `e2e-${randomUUID()}`,
      );
      return { uid, seed: createSeeder(uid) };
    });
  },
});

export { expect };

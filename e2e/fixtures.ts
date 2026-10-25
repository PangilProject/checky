import { test as base, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createSeeder, type Seeder } from "./seed";
import { watchFirestore } from "./network";

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
   * 일부러 실패를 일으키는 테스트에서 나와도 되는 콘솔 에러. `test.use({ expectedError })` 로 정한다.
   * 넓게 잡으면 진짜 에러까지 묻히므로 그 테스트가 일으키는 에러만 적는다.
   * 배열이 아니라 정규식 하나다. test.use 는 배열을 [값, 옵션] 으로 읽어 여러 개를 넘길 수 없다.
   */
  expectedError: RegExp | null;
  /**
   * 화면이 오늘로 볼 날짜(`YYYY-MM-DD`, 서울 시각). `test.use({ today })` 로 정한다.
   * 날짜에 따라 결과가 달라지는 화면을 언제 돌려도 같게 만든다.
   */
  today: string | null;
  fixedClock: void;
  /** waitForSaved 가 쓰도록 Firestore 요청을 센다 */
  firestoreWatch: void;
};

export const test = base.extend<Fixtures>({
  today: [null, { option: true }],

  expectedError: [null, { option: true }],

  firestoreWatch: [
    async ({ page }, use) => {
      watchFirestore(page);
      await use();
    },
    { auto: true },
  ],

  fixedClock: [
    async ({ page, today }, use) => {
      if (today) await page.clock.setFixedTime(new Date(`${today}T10:00:00+09:00`));
      await use();
    },
    { auto: true },
  ],

  pageErrors: [
    async ({ page, expectedError }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      // 같은 문서를 동시에 고친 트랜잭션은 늦은 쪽 커밋이 FAILED_PRECONDITION 으로 거절되고
      // SDK 가 다시 시도해 성공한다. 브라우저는 거절된 첫 시도를 콘솔 에러로 남기므로,
      // 실제로 거절된 횟수만큼만 그 기록을 걸러 낸다. 일괄로 무시하면 진짜 400 이 묻힌다.
      let retriedCommits = 0;
      page.on("response", async (response) => {
        if (response.status() !== 400 || !response.url().endsWith("documents:commit")) return;
        const body = await response.text().catch(() => "");
        if (body.includes("FAILED_PRECONDITION")) retriedCommits += 1;
      });

      await use(errors);

      const unexpected = errors.filter((error) => {
        if (expectedError?.test(error)) return false;
        if (retriedCommits > 0 && error.includes("status of 400")) {
          retriedCommits -= 1;
          return false;
        }
        return true;
      });
      expect(unexpected, "화면에서 에러가 났습니다").toEqual([]);
    },
    { auto: true },
  ],

  signIn: async ({ page }, use) => {
    await use(async () => {
      // 로그인 화면은 로그인하자마자 홈으로 보내, 홈이 시드보다 먼저 데이터를 읽고 월간 통계를
      // 만들어 버린다. 데이터를 읽지도 다른 곳으로 보내지도 않는 화면에서 로그인한다
      await page.goto("/privacy");
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

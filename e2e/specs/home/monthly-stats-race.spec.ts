import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { waitForSaved } from "../../network";

test.use({ today: "2026-10-21" });

/**
 * 그 달의 월간 통계 문서를 처음 만드는 쓰기를 잠시 붙잡는다.
 * 실제로는 네트워크 왕복 한 번 동안 열리는 틈인데, 테스트에서는 그 틈을 넓혀 조작을 끼워 넣는다.
 */
const holdFirstStatsWrite = (page: Page, ms = 2_000) => {
  let held = false;
  return page.route("**/documents:commit*", async (route) => {
    if (!held && route.request().postData()?.includes("/monthlyStats/")) {
      held = true;
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
    await route.fallback();
  });
};

const day21 = (page: Page, remaining: number) =>
  page.getByRole("button", { name: `10월 21일, 남은 일 ${remaining}개` });

test.describe(
  "TC-HOME-016 월간 통계 문서를 처음 만드는 중의 조작이 집계에서 빠지지 않는다",
  { tag: "@regression" },
  () => {
    test("할 일 추가", async ({ page, signIn }) => {
      const { seed } = await signIn();
      const category = await seed.category({ name: "업무" });
      await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
      await holdFirstStatsWrite(page);

      await page.goto("/home");
      await expect(day21(page, 1)).toBeVisible();
      await page.getByRole("button", { name: "업무에 할 일 추가" }).click();
      await page.getByLabel("할 일 입력").fill("보고서");
      await page.getByLabel("할 일 입력").press("Enter");
      await expect(day21(page, 2)).toBeVisible();

      await waitForSaved(page);
      await page.reload();
      await expect(day21(page, 2)).toBeVisible();
    });

    test("루틴 체크", async ({ page, signIn }) => {
      const { seed } = await signIn();
      const category = await seed.category({ name: "업무" });
      await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
      await holdFirstStatsWrite(page);

      await page.goto("/home");
      await expect(day21(page, 1)).toBeVisible();
      await page.getByRole("button", { name: "독서 10월 21일", exact: true }).click();
      await expect(day21(page, 0)).toBeVisible();

      await waitForSaved(page);
      await page.reload();
      await expect(day21(page, 0)).toBeVisible();
    });
  },
);

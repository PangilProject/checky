import { test, expect } from "../../fixtures";

test.use({ today: "2026-10-21" });

test.describe("마이", { tag: "@feature" }, () => {
  test(
    "TC-MY-005 다크 테마를 고르면 바로 바뀌고 새로고침해도 유지된다",
    { annotation: { type: "출처", description: "40d07b7" } },
    async ({ page, signIn }) => {
      await signIn();
      await page.goto("/my");
      const dark = page.getByRole("button", { name: "다크", exact: true });

      await dark.click();
      await expect(dark).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("html")).toHaveClass(/\bdark\b/);
      await page.reload();
      await expect(page.getByRole("button", { name: "다크", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("html")).toHaveClass(/\bdark\b/);

      await page.getByRole("button", { name: "라이트", exact: true }).click();
      await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    },
  );

  test(
    "TC-MY-006 프로필과 최근 6개월 달성률을 보여 준다",
    { annotation: { type: "출처", description: "1fce43f, 9a95573" } },
    async ({ page, signIn }) => {
      const { email, seed } = await signIn();
      await seed.monthlyStats({
        month: "2026-09",
        days: {
          "10": { total: 4, completed: 3, remaining: 1, taskTotal: 4, taskCompleted: 3, routineTotal: 0, routineCompleted: 0 },
          "20": { total: 6, completed: 4, remaining: 2, taskTotal: 6, taskCompleted: 4, routineTotal: 0, routineCompleted: 0 },
        },
      });
      await page.goto("/my");

      await expect(page.getByText("E2E 사용자", { exact: true })).toBeVisible();
      await expect(page.getByText(email, { exact: true })).toBeVisible();
      const rows = page.getByRole("listitem");
      await expect(rows).toHaveCount(6);
      await expect(rows.first()).toContainText("5월");
      await expect(rows.filter({ hasText: /^9월/ })).toContainText("70%");
      await expect(rows.filter({ hasText: /^8월/ })).toContainText("기록 없음");
    },
  );

  test("TC-MY-007 탈퇴 확인에서 취소하면 아무것도 바뀌지 않는다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/my");
    let popupOpened = false;
    page.on("popup", () => (popupOpened = true));

    await page.getByRole("button", { name: "회원탈퇴" }).click();
    await page.getByRole("dialog", { name: "정말로 탈퇴하시겠습니까?" }).getByRole("button", { name: "취소" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/my$/);
    expect(popupOpened).toBe(false);
  });
});

import { test, expect } from "../../fixtures";

test.describe("스모크: 로그인 없이 여는 화면", { tag: "@smoke" }, () => {
  test("TC-SMOKE-001 소개 화면이 열린다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Checky/ })).toBeAttached();
  });

  test("TC-SMOKE-002 로그인 화면에 Google 로그인 버튼이 있다", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Google로 시작하기" })).toBeVisible();
  });

  test("TC-SMOKE-003 약관과 개인정보 처리방침이 열린다", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("TC-SMOKE-004 로그인이 필요한 화면은 로그인 화면으로 보낸다", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC-SMOKE-005 없는 주소는 404 화면을 보여 준다", async ({ page }) => {
    await page.goto("/no-such-page");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});

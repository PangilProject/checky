import { test, expect } from "../../fixtures";

/** 처음 가입한 사용자(데이터 없음)가 보는 각 화면의 제목 */
const PAGES = [
  { menu: "홈", path: "/home", heading: "달성 현황" },
  { menu: "카테고리", path: "/category", heading: "진행중인 카테고리" },
  { menu: "루틴", path: "/routine", heading: "루틴 페이지" },
  { menu: "기록", path: "/record", heading: "돌아보기" },
  { menu: "마이", path: "/my", heading: "마이 정보" },
];

test.describe("스모크: 로그인한 사용자의 화면", { tag: "@smoke" }, () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn();
  });

  for (const { path, heading } of PAGES) {
    test(`TC-SMOKE-010 ${path} 화면이 열린다`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    });
  }

  test("TC-SMOKE-011 헤더 메뉴로 모든 화면을 오간다", async ({ page }) => {
    await page.goto("/home");
    for (const { menu, path, heading } of PAGES) {
      await page.getByRole("link", { name: menu, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });
});

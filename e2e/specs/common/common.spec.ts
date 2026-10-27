import { test, expect } from "../../fixtures";
import { seedNotice } from "../../seed";

test.describe("공통", { tag: "@feature" }, () => {
  test("TC-COMMON-002 로그인한 사용자가 / 나 /login 에 가면 /home 으로 간다", async ({ page, signIn }) => {
    await signIn();
    for (const path of ["/", "/login"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/home$/);
      await expect(page.getByRole("heading", { name: "달성 현황" })).toBeVisible();
    }
  });

  test("TC-COMMON-003 공지는 고정 공지가 먼저, 상세에서 이전·다음으로 오간다", async ({ page, signIn }) => {
    // 공지는 모든 사용자가 함께 본다. 다른 실행이 남긴 공지와 섞이지 않게 고유 제목을 쓰고,
    // 이 테스트의 공지가 가장 최근이 되도록 앞으로의 시각을 준다.
    // 세 공지를 1ms 간격으로 붙여 두어, 동시에 도는 다른 실행의 공지가 사이에 끼지 못하게 한다
    const run = Date.now().toString(36);
    const base = Date.now() + 24 * 60 * 60_000;
    await seedNotice({ title: `고정 ${run}`, pinned: true, createdAt: new Date(base) });
    await seedNotice({ title: `새 공지 ${run}`, createdAt: new Date(base + 2) });
    await seedNotice({ title: `옛 공지 ${run}`, createdAt: new Date(base + 1) });
    await signIn();
    await page.goto("/home");

    await page.getByRole("button", { name: "공지", exact: true }).click();
    const list = page.getByRole("dialog", { name: "공지 목록" });
    const ours = list.getByRole("button").filter({ hasText: run });
    await expect(ours).toHaveText([new RegExp(`^고정 ${run}`), new RegExp(`^새 공지 ${run}`), new RegExp(`^옛 공지 ${run}`)]);

    await ours.nth(1).click();
    const detail = page.getByRole("dialog", { name: "공지사항" });
    await expect(detail).toContainText(`새 공지 ${run}`);
    await detail.getByRole("button", { name: `다음 공지: 옛 공지 ${run}` }).click();
    await expect(detail).toContainText(`옛 공지 ${run}`);

    await detail.getByRole("button", { name: "공지 목록으로 돌아가기" }).click();
    await expect(list).toBeVisible();
    await list.getByRole("button", { name: "닫기" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test(
    "TC-COMMON-004 푸터에서 약관으로 가고, 인스타그램은 새 창으로 열린다",
    { annotation: { type: "출처", description: "10d7c86" } },
    async ({ page, signIn }) => {
      await signIn();
      await page.goto("/home");
      await expect(page.getByRole("link", { name: "checky 인스타그램 (새 창)" })).toHaveAttribute("target", "_blank");
      await page.getByRole("contentinfo").getByRole("link", { name: "이용약관" }).click();
      await expect(page).toHaveURL(/\/terms$/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    },
  );
});

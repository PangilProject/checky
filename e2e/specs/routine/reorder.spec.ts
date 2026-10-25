import { test, expect } from "../../fixtures";
import { dragTo } from "../../drag";

test.use({ today: "2026-10-21" });

test(
  "TC-ROUTINE-001 루틴 순서 변경이 기록 화면에 반영된다",
  { tag: "@regression", annotation: { type: "출처", description: "8fa53e9" } },
  async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    for (const [orderIndex, title] of ["스트레칭", "물 마시기", "독서"].entries()) {
      await seed.routine({ title, categoryId: category.id, orderIndex, startDate: "2026-10-01" });
    }
    const recordRows = page.getByRole("button", { name: / 기록 보기$/ });

    // 기록 화면을 먼저 열어, 루틴 목록이 캐시에 남은 상태를 만든다
    await page.goto("/record");
    await expect(recordRows).toHaveText([/^스트레칭/, /^물 마시기/, /^독서/]);

    await page.getByRole("link", { name: "루틴", exact: true }).click();
    // 다음 화면 코드를 받는 동안 기록 화면이 남아 있고, 거기에도 같은 이름의 버튼이 있다
    await expect(page.getByRole("heading", { name: "건강" })).toBeVisible();
    const saved = page.waitForResponse((response) => response.url().includes(":commit"));
    // 행 전체(끌기 손잡이)도 같은 이름의 버튼으로 잡혀, aria-label 을 가진 제목 버튼으로 집는다
    await dragTo(page, page.getByLabel("독서 기록 보기"), page.getByLabel("스트레칭 기록 보기"));
    await saved;

    await page.getByRole("link", { name: "기록", exact: true }).click();
    await expect(recordRows).toHaveText([/^독서/, /^스트레칭/, /^물 마시기/]);
  },
);

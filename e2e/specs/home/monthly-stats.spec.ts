import { test, expect } from "../../fixtures";
import { waitForSaved } from "../../network";

test.use({ today: "2026-10-21" });

test(
  "TC-HOME-004 루틴이 있는 날 할 일을 추가해도 루틴 몫이 사라지지 않는다",
  { tag: "@regression", annotation: { type: "출처", description: "9a95573" } },
  async ({ page, signIn }) => {
    // 이 달의 월간 통계 문서는 없다. 홈을 처음 열 때 만들어진다
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    await page.goto("/home");
    const day21 = (remaining: number) =>
      page.getByRole("button", { name: `10월 21일, 남은 일 ${remaining}개` });
    await expect(day21(1)).toBeVisible();

    await page.getByRole("button", { name: "업무에 할 일 추가" }).click();
    await page.getByLabel("할 일 입력").fill("보고서");
    await page.getByLabel("할 일 입력").press("Enter");
    await expect(day21(2)).toBeVisible();

    await page.getByRole("button", { name: "독서 10월 21일" }).click();
    await expect(page.getByRole("button", { name: "독서 10월 21일", pressed: true })).toBeVisible();
    await expect(day21(1)).toBeVisible();

    await waitForSaved(page);
    await page.reload();
    await expect(day21(1)).toBeVisible();
    // 이번 주 일~수요일의 루틴 4번과 할 일 1개 중 루틴 1번
    await expect(page.getByText(/해냈어요/)).toHaveText(/5개 중\s*1개\s*해냈어요/);

    // 새로고침 뒤 늦게 도는 보정이 숫자를 다시 바꾸지 않는다
    await waitForSaved(page);
    await expect(day21(1)).toBeVisible();
  },
);

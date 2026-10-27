import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { waitForSaved } from "../../network";

// 10월 21일(수). 그 주는 10월 18일(일)~24일(토)
test.use({ today: "2026-10-21" });

/** 루틴 상세 → 수정 → 요일 토글 → 저장. 변경 적용 날짜는 기본값(오늘) 그대로 둔다 */
const changeDays = async (page: Page, title: string, toggle: string[]) => {
  await page.getByRole("button", { name: `${title} 상세 보기`, exact: true }).click();
  await page.getByRole("dialog", { name: "루틴 상세" }).getByRole("button", { name: "수정" }).click();
  const edit = page.getByRole("dialog", { name: "루틴 수정" });
  for (const day of toggle) await edit.getByRole("button", { name: day, exact: true }).click();
  await edit.getByRole("button", { name: "저장" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

test.describe("루틴", { tag: "@feature" }, () => {
  test("TC-ROUTINE-002 반복 요일을 바꿔도 바꾸기 전 기록은 그대로다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    await page.goto("/routine");

    const history = page.getByRole("dialog", { name: "독서" });
    await page.getByRole("button", { name: "독서 기록 보기", exact: true }).click();
    await expect(history.getByRole("img", { name: "10월 24일 예정" })).toBeVisible();
    await page.keyboard.press("Escape");

    await changeDays(page, "독서", ["일", "토"]);

    await page.getByRole("button", { name: "독서 기록 보기", exact: true }).click();
    // 바꾸기 전의 일요일은 그대로 해야 했던 날로 남는다
    await expect(history.getByRole("img", { name: "10월 18일 못 함" })).toBeVisible();
    // 바꾼 뒤의 토요일은 더 이상 할 날이 아니고, 평일은 그대로 예정이다
    await expect(history.getByRole("img", { name: "10월 24일 예정" })).toHaveCount(0);
    await expect(history.getByRole("img", { name: "10월 23일 예정" })).toBeVisible();

    const timeline = history.getByRole("listitem");
    await expect(timeline).toHaveCount(2);
    await expect(timeline.nth(0)).toContainText("일 월 화 수 목 금 토");
    await expect(timeline.nth(0)).toContainText("10월 1일 ~ 10월 20일");
    await expect(timeline.nth(1)).toContainText("월 화 수 목 금 · 지금");
  });

  test("TC-ROUTINE-003 요일 변경이 홈 주간 표에 반영된다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    const cell = (date: string) => page.getByRole("button", { name: `독서 ${date}`, exact: true });

    // 홈을 먼저 열어 주간 루틴 표가 캐시에 남은 상태를 만든다
    await page.goto("/home");
    await expect(cell("10월 22일")).toBeVisible();

    await page.getByRole("link", { name: "루틴", exact: true }).click();
    await expect(page.getByRole("heading", { name: "건강" })).toBeVisible();
    await changeDays(page, "독서", ["일", "화", "목", "토"]);
    await waitForSaved(page);

    await page.getByRole("link", { name: "홈", exact: true }).click();
    // 바꾸기 전 날짜는 그대로, 오늘부터는 월·수·금만
    for (const date of ["10월 18일", "10월 19일", "10월 20일", "10월 21일", "10월 23일"]) {
      await expect(cell(date)).toBeVisible();
    }
    for (const date of ["10월 22일", "10월 24일"]) {
      await expect(cell(date)).toHaveCount(0);
    }
  });

  test("TC-ROUTINE-004 루틴을 만들면 목록과 홈에 바로 나온다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "건강" });
    await page.goto("/routine");
    await expect(page.getByText("추가를 눌러 이 분류의 첫 루틴을 만들어보세요.")).toBeVisible();

    await page.getByRole("button", { name: "추가", exact: true }).click();
    const create = page.getByRole("dialog", { name: "루틴 추가" });
    await create.getByLabel("루틴명").fill("독서");
    await create.getByRole("button", { name: "월", exact: true }).click();
    await create.getByRole("button", { name: "수", exact: true }).click();
    await create.getByRole("button", { name: "저장" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "독서 기록 보기", exact: true })).toHaveText(/독서\s*월\s*수/);
    await expect(page.getByText("추가를 눌러 이 분류의 첫 루틴을 만들어보세요.")).toHaveCount(0);

    await waitForSaved(page);
    await page.getByRole("link", { name: "홈", exact: true }).click();
    // 오늘(수) 시작이라 이번 주에는 수요일만 할 날이다
    await expect(page.getByRole("button", { name: "독서 10월 21일", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "독서 10월 19일", exact: true })).toHaveCount(0);
  });
});

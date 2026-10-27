import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { waitForSaved } from "../../network";

const tile = (page: Page, label: string) =>
  page.getByRole("term").filter({ hasText: new RegExp(`^${label}$`) }).locator("xpath=following-sibling::dd[1]");
const section = (page: Page, heading: string) =>
  page.locator("section").filter({ has: page.getByRole("heading", { name: heading, exact: true }) });
const period = (page: Page) => page.getByRole("heading", { name: "돌아보기" }).locator("xpath=following-sibling::p[1]");
const goTo = async (page: Page, menu: "홈" | "기록") => {
  await page.getByRole("link", { name: menu, exact: true }).click();
  await expect(page.getByRole("heading", { name: menu === "기록" ? "돌아보기" : "달성 현황" })).toBeVisible();
};
const weekMode = (page: Page) => page.getByRole("group", { name: "기간" }).getByRole("button", { name: "주간" }).click();

test.describe("기록: 기간 이동", { tag: "@feature" }, () => {
  test.describe(() => {
    test.use({ today: "2026-10-21" });

    test("TC-RECORD-006 이전·다음으로 오가며 기간이 바뀌고, 미래 기간은 세지 않는다", async ({ page, signIn }) => {
      const { seed } = await signIn();
      const category = await seed.category({ name: "공부" });
      await seed.task({ title: "9월 일", category, date: "2026-09-15" });
      await seed.task({ title: "10월 일 1", category, date: "2026-10-10", orderIndex: 0 });
      await seed.task({ title: "10월 일 2", category, date: "2026-10-11", orderIndex: 1 });
      await page.goto("/record");
      await expect(period(page)).toHaveText("2026년 10월 · 10월 21일까지");
      await expect(tile(page, "해낸 할 일")).toHaveText("0 / 2");

      await page.getByRole("button", { name: "이전 달" }).click();
      await expect(period(page)).toHaveText("2026년 9월");
      await expect(tile(page, "해낸 할 일")).toHaveText("0 / 1");

      await page.getByRole("button", { name: "다음 달" }).click();
      await page.getByRole("button", { name: "다음 달" }).click();
      await expect(period(page)).toHaveText("2026년 11월");
      await expect(page.getByText("아직 오지 않은 기간이에요.")).toBeVisible();

      await page.getByRole("button", { name: "이번 달" }).click();
      await expect(period(page)).toHaveText("2026년 10월 · 10월 21일까지");
    });

    test("TC-RECORD-008 월간에서 옮긴 달은 주간으로 바꿔도 이어진다", async ({ page, signIn }) => {
      await signIn();
      await page.goto("/record");
      await page.getByRole("button", { name: "이전 달" }).click();
      await expect(period(page)).toHaveText("2026년 9월");
      // 달을 옮기면 1일로 맞춰지므로 9월 1일이 속한 주가 나온다 (의도한 동작)
      await weekMode(page);
      await expect(period(page)).toHaveText("8월 30일 ~ 9월 5일");
    });
  });

  test.describe(() => {
    test.use({ today: "2027-01-05" });

    test("TC-RECORD-007 연도가 바뀌는 달로 이동한다", async ({ page, signIn }) => {
      const { seed } = await signIn();
      const category = await seed.category({ name: "공부" });
      const task = await seed.task({ title: "연말 정리", category, date: "2026-12-31" });
      await seed.taskLog({ taskId: task.id, date: "2026-12-31", completed: true });
      await page.goto("/record");

      await page.getByRole("button", { name: "이전 달" }).click();
      await expect(period(page)).toHaveText("2026년 12월");
      await expect(tile(page, "해낸 할 일")).toHaveText("1 / 1");

      await weekMode(page);
      await page.getByRole("button", { name: "이번 주" }).click();
      await expect(period(page)).toHaveText("1월 3일 ~ 1월 9일 · 1월 5일까지");
    });
  });
});

test.describe("기록: 다른 화면에서 한 일", { tag: "@feature" }, () => {
  test.use({ today: "2026-10-21" });

  test("TC-RECORD-009 루틴 행을 누르면 체크한 날이 \"했음\" 으로 보인다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    const history = page.getByRole("dialog", { name: "독서" });

    // 기록 창을 한 번 열어 그 기간의 기록을 캐시에 남긴다
    await page.goto("/record");
    await page.getByRole("button", { name: "독서 기록 보기", exact: true }).click();
    await expect(history.getByRole("img", { name: "10월 20일 못 함" })).toBeVisible();
    await page.keyboard.press("Escape");

    await goTo(page, "홈");
    await page.getByRole("button", { name: "독서 10월 20일", exact: true }).click();
    await waitForSaved(page);
    await goTo(page, "기록");
    await page.getByRole("button", { name: "독서 기록 보기", exact: true }).click();
    await expect(history.getByRole("img", { name: "10월 20일 했음" })).toBeVisible();
  });

  test("TC-RECORD-010 홈에서 추가·삭제한 할 일이 반영된다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "공부" });
    const done = await seed.task({ title: "C", category, date: "2026-10-21" });
    await seed.taskLog({ taskId: done.id, date: "2026-10-21", completed: true });
    await page.goto("/record");
    await expect(tile(page, "해낸 할 일")).toHaveText("1 / 1");

    await goTo(page, "홈");
    await page.getByRole("button", { name: "공부에 할 일 추가" }).click();
    await page.getByLabel("할 일 입력").fill("D");
    await page.getByLabel("할 일 입력").press("Enter");
    await expect(page.getByRole("checkbox", { name: "D", exact: true })).toBeVisible();
    await waitForSaved(page);
    await goTo(page, "기록");
    await expect(tile(page, "해낸 할 일")).toHaveText("1 / 2");
    await expect(section(page, "남은 할 일").getByRole("listitem")).toHaveText([/^오늘.*D$/]);

    await goTo(page, "홈");
    await page.getByRole("button", { name: "C 상세 보기", exact: true }).click();
    await page.getByRole("dialog", { name: "태스크 상세" }).getByRole("button", { name: "삭제", exact: true }).click();
    await page.getByRole("dialog", { name: "할 일을 삭제할까요?" }).getByRole("button", { name: "삭제" }).click();
    await expect(page.getByRole("checkbox", { name: "C", exact: true })).toHaveCount(0);
    await waitForSaved(page);
    await goTo(page, "기록");
    await expect(tile(page, "해낸 할 일")).toHaveText("0 / 1");
    await expect(page.getByText("이 기간에 해낸 할 일이 없어요.")).toBeVisible();
  });

  test("TC-RECORD-011 홈에서 일괄 이동하면 반영된다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "공부" });
    await seed.task({ title: "가", category, date: "2026-10-20", orderIndex: 0 });
    await seed.task({ title: "나", category, date: "2026-10-20", orderIndex: 1 });
    await page.goto("/record");
    const remaining = section(page, "남은 할 일").getByRole("listitem");
    await expect(remaining).toHaveText([/^10\/20.*가$/, /^10\/20.*나$/]);

    await goTo(page, "홈");
    const taskSection = page.getByRole("region", { name: "할 일 목록", exact: true });
    await taskSection.getByRole("button", { name: "이전" }).click();
    await expect(taskSection.getByText(/^2026년 10월 20일/)).toBeVisible();
    await page.getByRole("button", { name: "리스트 메뉴" }).click();
    const menu = page.getByRole("dialog", { name: "리스트 메뉴" });
    await menu.getByRole("radio", { name: "미완료 할 일을 오늘 하기" }).click();
    await menu.getByRole("button", { name: "완료" }).click();
    await expect(page.getByRole("checkbox", { name: "가" })).toHaveCount(0);
    await waitForSaved(page);

    await goTo(page, "기록");
    await expect(remaining).toHaveText([/^오늘.*가$/, /^오늘.*나$/]);
  });
});

test.describe("기록: 목록과 빈 상태", { tag: "@feature" }, () => {
  test.use({ today: "2026-10-21" });

  test("TC-RECORD-012 남은 할 일이 10개를 넘으면 접고 펼친다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "공부" });
    for (let day = 1; day <= 12; day++) {
      const date = `2026-10-${String(day).padStart(2, "0")}`;
      await seed.task({ title: `할 일 ${day}`, category, date });
    }
    await page.goto("/record");
    const remaining = section(page, "남은 할 일").getByRole("listitem");
    await expect(remaining).toHaveCount(10);
    await page.getByRole("button", { name: "2개 더 보기" }).click();
    await expect(remaining).toHaveCount(12);
    await expect(remaining.last()).toContainText("할 일 12");
    await page.getByRole("button", { name: "접기" }).click();
    await expect(remaining).toHaveCount(10);
  });

  test("TC-RECORD-013 빈 사용자는 \"-\" 와 안내 문구를 본다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/record");
    await expect(tile(page, "달성률")).toHaveText("-");
    await expect(page.getByText("이 기간에 해낸 할 일이 없어요.")).toBeVisible();
    await expect(page.getByText("이 기간의 할 일을 모두 해냈어요.")).toBeVisible();
    await expect(page.getByText("이 기간에 해야 했던 루틴이 없어요.")).toBeVisible();
  });
});

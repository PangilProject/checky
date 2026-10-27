import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { waitForSaved } from "../../network";

/** 기록 화면 위쪽 칸의 값. 예: tile(page, "해낸 할 일") → "1 / 2" */
const tile = (page: Page, label: string) =>
  page
    .getByRole("term")
    .filter({ hasText: new RegExp(`^${label}$`) })
    .locator("xpath=following-sibling::dd[1]");

const section = (page: Page, heading: string) =>
  page.locator("section").filter({ has: page.getByRole("heading", { name: heading, exact: true }) });

const goTo = async (page: Page, menu: "홈" | "기록") => {
  await page.getByRole("link", { name: menu, exact: true }).click();
  // 다음 화면 코드를 받는 동안 이전 화면이 남아 있으므로 새 화면이 뜬 것을 먼저 본다
  await expect(page.getByRole("heading", { name: menu === "기록" ? "돌아보기" : "달성 현황" })).toBeVisible();
};

test.describe("기록: 다른 화면에서 한 일이 새로고침 없이 반영된다", { tag: "@feature" }, () => {
  test.use({ today: "2026-10-21" });

  test("TC-RECORD-001 홈에서 할 일을 체크하면 기록 숫자가 바뀐다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "공부" });
    await seed.task({ title: "A", category, date: "2026-10-21", orderIndex: 0 });
    await seed.task({ title: "B", category, date: "2026-10-21", orderIndex: 1 });

    await page.goto("/record");
    await expect(tile(page, "해낸 할 일")).toHaveText("0 / 2");

    await goTo(page, "홈");
    await page.getByRole("checkbox", { name: "A", exact: true }).click();
    await waitForSaved(page);

    await goTo(page, "기록");
    await expect(tile(page, "해낸 할 일")).toHaveText("1 / 2");
    await expect(tile(page, "남은 할 일")).toHaveText("1개");
    await expect(tile(page, "달성률")).toHaveText("50%");
    await expect(section(page, "분류별로 해낸 할 일").getByRole("listitem")).toHaveText(["공부1개"]);
    await expect(section(page, "남은 할 일").getByRole("listitem")).toHaveText([/^오늘.*B$/]);
  });

  test("TC-RECORD-002 홈에서 루틴을 체크하면 루틴 수행이 바뀐다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-18" });
    const routineRow = page.getByRole("button", { name: "독서 기록 보기", exact: true });
    const openWeek = () => page.getByRole("group", { name: "기간" }).getByRole("button", { name: "주간" }).click();

    await page.goto("/record");
    await openWeek();
    await expect(tile(page, "루틴 수행")).toHaveText("0 / 4");

    await goTo(page, "홈");
    await page.getByRole("button", { name: "독서 10월 21일", exact: true }).click();
    await waitForSaved(page);
    await goTo(page, "기록");
    await openWeek();
    await expect(tile(page, "루틴 수행")).toHaveText("1 / 4");
    await expect(routineRow).toContainText("1 / 4");
    await expect(routineRow).toContainText("25%");

    await goTo(page, "홈");
    await page.getByRole("button", { name: "독서 10월 21일", exact: true }).click();
    await waitForSaved(page);
    await goTo(page, "기록");
    await openWeek();
    await expect(tile(page, "루틴 수행")).toHaveText("0 / 4");
  });

  test("TC-RECORD-003 할 일을 다른 달로 옮기면 두 달 모두 맞게 센다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "공부" });
    const task = await seed.task({ title: "X", category, date: "2026-10-21" });
    await seed.taskLog({ taskId: task.id, date: "2026-10-21", completed: true });

    // 10월과 9월을 한 번씩 열어 두 달 모두 캐시에 남긴다
    await page.goto("/record");
    await expect(tile(page, "해낸 할 일")).toHaveText("1 / 1");
    await page.getByRole("button", { name: "이전 달" }).click();
    await expect(page.getByText("2026년 9월", { exact: true })).toBeVisible();
    await expect(tile(page, "해낸 할 일")).toHaveText("0 / 0");

    await goTo(page, "홈");
    await page.getByRole("button", { name: "X 상세 보기", exact: true }).click();
    await page.getByRole("dialog", { name: "태스크 상세" }).getByRole("button", { name: "이동" }).click();
    const pick = page.getByRole("dialog", { name: "날짜 선택" });
    await pick.getByRole("button", { name: /2026/ }).click();
    await page.getByRole("button", { name: "이전 달" }).click();
    await page.getByRole("button", { name: "2026년 9월 30일" }).click();
    await pick.getByRole("button", { name: "이동" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "X" })).toHaveCount(0);
    await waitForSaved(page);

    await goTo(page, "기록");
    await expect(page.getByText(/^2026년 10월/)).toBeVisible();
    await expect(tile(page, "해낸 할 일")).toHaveText("0 / 0");
    await page.getByRole("button", { name: "이전 달" }).click();
    await expect(tile(page, "해낸 할 일")).toHaveText("1 / 1");
    await expect(tile(page, "남은 할 일")).toHaveText("0개");
  });
});

test.describe("기록: 기간 경계", { tag: "@feature" }, () => {
  test.describe("오늘 2026-10-21(수)", () => {
    test.use({ today: "2026-10-21" });

    test("TC-RECORD-004 오늘 뒤의 날은 세지 않는다", async ({ page, signIn }) => {
      const { seed } = await signIn();
      const category = await seed.category({ name: "공부" });
      for (const [i, date] of ["2026-10-20", "2026-10-21", "2026-10-22"].entries()) {
        await seed.task({ title: `할 일 ${date.slice(8)}일`, category, date, orderIndex: i });
      }
      await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-18" });

      await page.goto("/record");
      await page.getByRole("group", { name: "기간" }).getByRole("button", { name: "주간" }).click();
      await expect(page.getByText("10월 18일 ~ 10월 24일 · 10월 21일까지")).toBeVisible();
      await expect(tile(page, "해낸 할 일")).toHaveText("0 / 2");
      await expect(tile(page, "루틴 수행")).toHaveText("0 / 4");
      await expect(section(page, "남은 할 일").getByRole("listitem")).toHaveText([
        /^10\/20.*할 일 20일$/,
        /^오늘.*할 일 21일$/,
      ]);
    });
  });

  test.describe("오늘 2026-10-01(목)", () => {
    test.use({ today: "2026-10-01" });

    test("TC-RECORD-005 주는 일요일에 시작하고, 두 달에 걸친 주를 합쳐 센다", async ({ page, signIn }) => {
      const { seed } = await signIn();
      const category = await seed.category({ name: "공부" });
      await seed.task({ title: "토요일", category, date: "2026-09-26" });
      const sunday = await seed.task({ title: "일요일", category, date: "2026-09-27" });
      await seed.taskLog({ taskId: sunday.id, date: "2026-09-27", completed: true });
      await seed.task({ title: "목요일", category, date: "2026-10-01" });

      await page.goto("/record");
      await page.getByRole("group", { name: "기간" }).getByRole("button", { name: "주간" }).click();
      await expect(page.getByText("9월 27일 ~ 10월 3일 · 10월 1일까지")).toBeVisible();
      await expect(tile(page, "해낸 할 일")).toHaveText("1 / 2");
      await expect(section(page, "남은 할 일").getByRole("listitem")).toHaveText([/^오늘.*목요일$/]);
    });
  });
});

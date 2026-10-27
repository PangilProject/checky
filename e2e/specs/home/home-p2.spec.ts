import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { dragTo } from "../../drag";
import { failWrites, waitForSaved } from "../../network";

// 10월 21일(수). 그 주는 10월 18일(일)~24일(토)
test.use({ today: "2026-10-21" });

const region = (page: Page, name: string) => page.getByRole("region", { name, exact: true });
const calendarDay = (page: Page, day: number) =>
  region(page, "캘린더").getByRole("button", { name: new RegExp(`^10월 ${day}일(,|$)`) });
const taskSubtitle = (page: Page, text: string | RegExp) => region(page, "할 일 목록").getByText(text);

const openListMenu = async (page: Page, option: string) => {
  await page.getByRole("button", { name: "리스트 메뉴" }).click();
  const menu = page.getByRole("dialog", { name: "리스트 메뉴" });
  await menu.getByRole("radio", { name: option }).click();
  await menu.getByRole("button", { name: "완료" }).click();
};

test.describe("홈: 할 일 옮기기", { tag: "@feature" }, () => {
  test("TC-HOME-007 \"이동\" 으로 완료한 할 일을 다른 날로 옮긴다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    const task = await seed.task({ title: "보고서", category, date: "2026-10-21" });
    await seed.taskLog({ taskId: task.id, date: "2026-10-21", completed: true });
    await page.goto("/home");

    await page.getByRole("button", { name: "보고서 상세 보기", exact: true }).click();
    await page.getByRole("dialog", { name: "태스크 상세" }).getByRole("button", { name: "이동" }).click();
    const pick = page.getByRole("dialog", { name: "날짜 선택" });
    await pick.getByRole("button", { name: /2026/ }).click();
    await page.getByRole("button", { name: "2026년 10월 23일" }).click();
    await pick.getByRole("button", { name: "이동" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "보고서" })).toHaveCount(0);

    await calendarDay(page, 23).click();
    await expect(taskSubtitle(page, /^2026년 10월 23일/)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "보고서" })).toBeChecked();
    // 완료한 채로 옮겼으므로 23일의 남은 일은 없다
    await expect(region(page, "캘린더").getByRole("button", { name: "10월 23일, 남은 일 0개" })).toBeVisible();
  });

  test("TC-HOME-008 리스트 메뉴로 미완료 할 일을 오늘로 옮긴다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "미완료", category, date: "2026-10-20", orderIndex: 0 });
    const done = await seed.task({ title: "완료함", category, date: "2026-10-20", orderIndex: 1 });
    await seed.taskLog({ taskId: done.id, date: "2026-10-20", completed: true });
    await page.goto("/home");

    // 오늘 목록에서 하면 옮길 것이 없다고 알린다
    await openListMenu(page, "미완료 할 일을 오늘 하기");
    await expect(page.getByText("이미 오늘 목록입니다.")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "리스트 메뉴" })).toHaveCount(0);

    await region(page, "할 일 목록").getByRole("button", { name: "이전" }).click();
    await expect(taskSubtitle(page, /^2026년 10월 20일/)).toBeVisible();
    await openListMenu(page, "미완료 할 일을 오늘 하기");
    await expect(page.getByRole("checkbox", { name: "미완료" })).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "완료함" })).toBeChecked();

    await region(page, "할 일 목록").getByRole("button", { name: "오늘" }).click();
    await expect(taskSubtitle(page, /^2026년 10월 21일/)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "미완료" })).not.toBeChecked();
  });

  test("TC-HOME-010 한 주 보기에서 끌어 옮기면 개수와 하루 보기에 반영된다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "보고서", category, date: "2026-10-21" });
    await page.goto("/home");
    await page.getByRole("button", { name: "한 주", exact: true }).click();

    await dragTo(page, page.getByLabel("보고서", { exact: true }), region(page, "10월 23일"));
    await expect(region(page, "10월 21일")).toContainText("할 일 0");
    await expect(region(page, "10월 23일")).toContainText("할 일 1");
    await expect(taskSubtitle(page, /0 \/ 1 완료$/)).toBeVisible();

    await page.getByRole("button", { name: "10월 23일 하루 보기" }).click();
    await expect(taskSubtitle(page, /^2026년 10월 23일/)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "보고서" })).toBeVisible();
  });
});

test.describe("홈: 일괄 삭제", { tag: "@feature" }, () => {
  test("TC-HOME-009 모든 할 일 삭제는 확인을 거치고, 대상이 없으면 알린다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "A", category, date: "2026-10-21", orderIndex: 0 });
    await seed.task({ title: "B", category, date: "2026-10-21", orderIndex: 1 });
    await page.goto("/home");
    const confirm = page.getByRole("dialog", { name: "모든 할 일을 삭제할까요?" });

    await openListMenu(page, "모든 할 일 삭제");
    await confirm.getByRole("button", { name: "취소" }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(2);

    await openListMenu(page, "모든 할 일 삭제");
    await confirm.getByRole("button", { name: "삭제" }).click();
    await expect(confirm).toHaveCount(0);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await expect(taskSubtitle(page, "2026년 10월 21일")).toBeVisible();

    // 지울 것이 없으면 알리고 확인 창을 남겨 둔다
    await openListMenu(page, "모든 할 일 삭제");
    await confirm.getByRole("button", { name: "삭제" }).click();
    await expect(page.getByText("삭제할 할 일이 없습니다.")).toBeVisible();
    await expect(confirm).toBeVisible();
  });
});

test.describe("홈: 루틴과 캘린더", { tag: "@feature" }, () => {
  test("TC-HOME-012 루틴 표 체크가 합계·캘린더에 반영된다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    await page.goto("/home");
    const table = region(page, "루틴 목록");
    const totalRow = table.getByRole("row").filter({ hasText: /^합계/ });

    await expect(calendarDay(page, 21)).toHaveAccessibleName("10월 21일, 남은 일 1개");
    await table.getByRole("button", { name: "독서 10월 21일", exact: true }).click();

    const checked = async () => {
      await expect(table.getByRole("button", { name: "독서 10월 21일", pressed: true })).toBeVisible();
      await expect(table.getByRole("row").filter({ hasText: /^독서/ })).toContainText("1 / 7");
      await expect(totalRow).toContainText("1/1");
      await expect(calendarDay(page, 21)).toHaveAccessibleName("10월 21일, 남은 일 0개");
    };
    await checked();
    await waitForSaved(page);
    await page.reload();
    await checked();
  });

  test("TC-HOME-013 캘린더 날짜를 누르면 모든 섹션이 그 날을 따라간다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "지난주 일", category, date: "2026-10-14" });
    await page.goto("/home");

    await calendarDay(page, 14).click();
    await expect(taskSubtitle(page, /^2026년 10월 14일/)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "지난주 일" })).toBeVisible();
    await expect(region(page, "루틴 목록").getByText("10월 11일 ~ 10월 17일")).toBeVisible();
    await expect(region(page, "달성 현황").getByText("10월 11일 ~ 10월 17일")).toBeVisible();

    await region(page, "할 일 목록").getByRole("button", { name: "오늘" }).click();
    await expect(taskSubtitle(page, /^2026년 10월 21일/)).toBeVisible();
    await expect(region(page, "루틴 목록").getByText("10월 18일 ~ 10월 24일")).toBeVisible();
  });

  test("TC-HOME-014 새 사용자는 카테고리를 만들러 갈 수 있다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/home");
    await expect(page.getByText("아직 카테고리가 없어요.")).toBeVisible();
    await page.getByRole("link", { name: "카테고리 만들기" }).click();
    await expect(page).toHaveURL(/\/category$/);
  });
});

test.describe("홈: 실패", { tag: "@feature" }, () => {
  test.use({ expectedError: /status of 500|Internal Server Error/ });

  test("TC-HOME-011 끌어 옮기기에 실패하면 원래 날로 돌아간다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "보고서", category, date: "2026-10-21" });
    await page.goto("/home");
    await page.getByRole("button", { name: "한 주", exact: true }).click();
    await expect(page.getByLabel("보고서", { exact: true })).toBeVisible();
    await waitForSaved(page);
    await failWrites(page);

    await dragTo(page, page.getByLabel("보고서", { exact: true }), region(page, "10월 23일"));
    await expect(page.getByText("할 일 이동에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(region(page, "10월 21일").getByLabel("보고서", { exact: true })).toBeVisible();
    await expect(region(page, "10월 23일")).toContainText("할 일 0");
  });

  test("TC-HOME-015 루틴 목록을 불러오지 못하면 다시 시도할 수 있다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    // 루틴 조회를 다시 시도하기 전까지 모두 실패시킨다(자동 재시도도 한 번 있다)
    let failing = true;
    await page.route("**/*:runQuery*", (route) =>
      failing && route.request().postData()?.includes('"routines"')
        ? route.fulfill({ status: 500, body: "{}" })
        : route.fallback(),
    );
    await page.goto("/home");
    const table = region(page, "루틴 목록");
    await expect(table.getByText("루틴 목록을 불러오지 못했습니다.")).toBeVisible();

    failing = false;
    await table.getByRole("button", { name: "다시 시도" }).click();
    await expect(table.getByRole("button", { name: "독서 10월 21일", exact: true })).toBeVisible();
  });
});

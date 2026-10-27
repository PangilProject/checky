import type { Locator, Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { dragTo } from "../../drag";
import { waitForSaved } from "../../network";

test.use({ today: "2026-10-21" });

/** 진행중 목록의 카테고리 이름을 차례대로 */
const activeNames = (page: Page) =>
  page
    .getByLabel(/ 카테고리 메뉴 열기$/)
    .evaluateAll((buttons) =>
      buttons
        .filter((button) => !button.closest("section, div")?.textContent?.includes("~"))
        .map((button) => button.getAttribute("aria-label")!.replace(/ 카테고리 메뉴 열기$/, "")),
    );

const colorOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).color);

const openMenu = (page: Page, name: string) =>
  page.getByRole("button", { name: `${name} 카테고리 메뉴 열기`, exact: true }).click();

test.describe("카테고리", { tag: "@feature" }, () => {
  test("TC-CATEGORY-001 카테고리를 만들면 진행중 목록 맨 뒤에 나타난다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "건강", orderIndex: 0 });
    await page.goto("/category");
    await expect(page.getByRole("button", { name: "건강 카테고리 메뉴 열기", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "추가", exact: true }).click();
    const create = page.getByRole("dialog", { name: "카테고리 추가" });
    await create.getByLabel("카테고리 이름").fill("공부");
    await create.getByRole("button", { name: "색상 선택" }).click();
    await create.getByRole("button", { name: "blue" }).click();
    await create.getByRole("button", { name: "저장" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    const check = async () => {
      await expect(page.getByRole("button", { name: "공부 카테고리 메뉴 열기", exact: true })).toBeVisible();
      expect(await activeNames(page)).toEqual(["건강", "공부"]);
      await openMenu(page, "공부");
      await expect(
        page.getByRole("dialog", { name: "카테고리 상세" }).getByRole("button", { name: "blue", pressed: true }),
      ).toHaveCount(1);
      await page.keyboard.press("Escape");
    };
    await check();
    await waitForSaved(page);
    await page.reload();
    await check();
  });

  test("TC-CATEGORY-005 종료하면 확인을 거쳐 종료된 카테고리로 옮겨진다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "A", orderIndex: 0 });
    await seed.category({ name: "B", orderIndex: 1 });
    await page.goto("/category");

    await openMenu(page, "A");
    const detail = page.getByRole("dialog", { name: "카테고리 상세" });
    const confirm = page.getByRole("dialog", { name: "카테고리를 종료할까요?" });
    await detail.getByRole("button", { name: "종료", exact: true }).click();
    await expect(confirm).toContainText("복구할 수 있습니다");
    await confirm.getByRole("button", { name: "취소" }).click();
    await expect(confirm).toHaveCount(0);
    await expect(detail).toBeVisible();
    await expect(page.getByRole("heading", { name: "종료된 카테고리" })).toHaveCount(0);

    await detail.getByRole("button", { name: "종료", exact: true }).click();
    await confirm.getByRole("button", { name: "종료" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "종료된 카테고리" })).toBeVisible();
    expect(await activeNames(page)).toEqual(["B"]);

    // 종료한 카테고리는 고칠 수 없고 되살릴 수만 있다
    await openMenu(page, "A");
    await expect(detail.getByRole("button", { name: "복구" })).toBeVisible();
    await expect(detail.getByRole("button", { name: "수정" })).toHaveCount(0);
    await page.keyboard.press("Escape");

    await page.getByRole("link", { name: "홈", exact: true }).click();
    await expect(page.getByRole("button", { name: "B에 할 일 추가" })).toBeVisible();
    await expect(page.getByRole("button", { name: "A에 할 일 추가" })).toHaveCount(0);
  });
});

test.describe("카테고리 변경이 다른 화면에 반영된다", { tag: "@regression" }, () => {
  test("TC-CATEGORY-003 순서 변경이 홈·루틴 화면에 반영된다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    for (const [orderIndex, name] of ["A", "B", "C"].entries()) {
      const category = await seed.category({ name, orderIndex });
      await seed.routine({ title: `루틴${name}`, categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    }
    const homeRows = page.getByRole("button", { name: / 10월 21일$/ });
    const routineHeadings = page.getByRole("heading", { level: 3 });

    // 두 화면을 먼저 열어 캐시에 옛 순서를 남긴다
    await page.goto("/home");
    await expect(homeRows).toHaveCount(3);
    await page.getByRole("link", { name: "루틴", exact: true }).click();
    await expect(routineHeadings).toHaveText(["A", "B", "C"]);

    await page.getByRole("link", { name: "카테고리", exact: true }).click();
    await expect(page.getByRole("heading", { name: "진행중인 카테고리" })).toBeVisible();
    await dragTo(page, page.getByText("C", { exact: true }), page.getByText("A", { exact: true }));
    await expect.poll(() => activeNames(page)).toEqual(["C", "A", "B"]);
    await waitForSaved(page);

    await page.getByRole("link", { name: "루틴", exact: true }).click();
    await expect(routineHeadings).toHaveText(["C", "A", "B"]);
    await page.getByRole("link", { name: "홈", exact: true }).click();
    await expect(homeRows.nth(0)).toHaveAccessibleName("루틴C 10월 21일");
    await expect(homeRows.nth(1)).toHaveAccessibleName("루틴A 10월 21일");
    await expect(homeRows.nth(2)).toHaveAccessibleName("루틴B 10월 21일");
  });

  test("TC-CATEGORY-004 이름·색을 바꾸면 루틴·기록·홈에 반영된다", async ({ page, signIn }) => {
    // 홈을 먼저 열어 둔 뒤 색을 바꾸면 주간 루틴 표에 옛 색이 남던 문제, 한 주 보기가 할 일에
    // 복사해 둔 옛 색을 그리던 문제를 함께 지킨다
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강", color: "#FF393C" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    const task = await seed.task({ title: "산책", category, date: "2026-10-21" });
    await seed.taskLog({ taskId: task.id, date: "2026-10-21", completed: true });
    const homeRoutineIcon = page.getByRole("button", { name: "독서 10월 21일", exact: true }).locator("svg");

    // 세 화면을 먼저 열어 캐시에 옛 이름·색을 남긴다
    await page.goto("/home");
    const oldColor = await colorOf(homeRoutineIcon);
    await page.getByRole("link", { name: "루틴", exact: true }).click();
    await expect(page.getByRole("heading", { name: "건강" })).toBeVisible();
    await page.getByRole("link", { name: "기록", exact: true }).click();
    await expect(page.getByRole("listitem").filter({ hasText: "건강" })).toBeVisible();

    await page.getByRole("link", { name: "카테고리", exact: true }).click();
    await openMenu(page, "건강");
    await page.getByRole("dialog", { name: "카테고리 상세" }).getByRole("button", { name: "수정" }).click();
    const edit = page.getByRole("dialog", { name: "카테고리 수정" });
    await edit.getByLabel("카테고리 이름").fill("운동");
    await edit.getByRole("button", { name: "색상 선택" }).click();
    await edit.getByRole("button", { name: "blue" }).click();
    await edit.getByRole("button", { name: "저장" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await waitForSaved(page);

    await page.getByRole("link", { name: "루틴", exact: true }).click();
    const heading = page.getByRole("heading", { name: "운동" });
    await expect(heading).toBeVisible();
    const newColor = await colorOf(heading);
    expect(newColor).not.toBe(oldColor);

    await page.getByRole("link", { name: "기록", exact: true }).click();
    await expect(page.getByRole("listitem").filter({ hasText: "운동" })).toBeVisible();
    await expect(page.getByText("건강", { exact: true })).toHaveCount(0);

    await page.getByRole("link", { name: "홈", exact: true }).click();
    await expect(page.getByRole("button", { name: "운동에 할 일 추가" })).toBeVisible();
    await expect(homeRoutineIcon).toHaveCSS("color", newColor);

    // 한 주 보기는 할 일 문서에 복사해 둔 색이 아니라 분류의 지금 색으로 그린다
    await page.getByRole("button", { name: "한 주", exact: true }).click();
    await expect(page.getByLabel("산책 (완료)").locator("svg")).toHaveCSS("color", newColor);
  });
});

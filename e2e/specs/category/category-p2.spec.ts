import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { dragTo } from "../../drag";
import { failWrites, waitForSaved } from "../../network";

test.use({ today: "2026-10-21" });

/** 진행중 목록의 카테고리 이름을 차례대로. 종료된 카테고리는 기간(~)이 붙어 빠진다 */
const activeNames = (page: Page) =>
  page
    .getByRole("heading", { name: "진행중인 카테고리" })
    .locator("xpath=ancestor::div[contains(@class,'flex-col')][1]")
    .getByLabel(/ 카테고리 메뉴 열기$/)
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label")!.replace(/ 카테고리 메뉴 열기$/, "")),
    );

const openMenu = (page: Page, name: string) =>
  page.getByRole("button", { name: `${name} 카테고리 메뉴 열기`, exact: true }).click();

const endCategory = async (page: Page, name: string) => {
  await openMenu(page, name);
  await page.getByRole("dialog", { name: "카테고리 상세" }).getByRole("button", { name: "종료", exact: true }).click();
  await page.getByRole("dialog", { name: "카테고리를 종료할까요?" }).getByRole("button", { name: "종료" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

const createCategory = async (page: Page, name: string) => {
  await page.getByRole("button", { name: "추가", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "카테고리 추가" });
  await dialog.getByLabel("카테고리 이름").fill(name);
  await dialog.getByRole("button", { name: "저장" }).click();
};

test.describe("카테고리: 순서", { tag: "@feature" }, () => {
  test(
    "TC-CATEGORY-002 가운데를 종료한 뒤 새로 만든 카테고리는 맨 뒤에 붙는다",
    { tag: "@regression", annotation: { type: "출처", description: "a8ddb5f, 5d1cd88" } },
    async ({ page, signIn }) => {
      const { seed } = await signIn();
      for (const [orderIndex, name] of ["A", "B", "C"].entries()) await seed.category({ name, orderIndex });
      await page.goto("/category");
      await expect.poll(() => activeNames(page)).toEqual(["A", "B", "C"]);

      await endCategory(page, "B");
      await createCategory(page, "D");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect.poll(() => activeNames(page)).toEqual(["A", "C", "D"]);
    },
  );

  test("TC-CATEGORY-006 복구하면 진행중 목록 맨 뒤로 돌아온다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "A", orderIndex: 0 });
    await seed.category({ name: "B", orderIndex: 1 });
    await seed.category({ name: "C", orderIndex: 2, ended: new Date("2026-10-10T10:00:00+09:00") });
    await page.goto("/category");
    await expect(page.getByRole("heading", { name: "종료된 카테고리" })).toBeVisible();

    await openMenu(page, "C");
    await page.getByRole("dialog", { name: "카테고리 상세" }).getByRole("button", { name: "복구" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect.poll(() => activeNames(page)).toEqual(["A", "B", "C"]);
    // 종료된 카테고리가 하나도 남지 않으면 섹션째 사라진다
    await expect(page.getByRole("heading", { name: "종료된 카테고리" })).toHaveCount(0);
  });
});

test.describe("카테고리: 입력과 저장", { tag: "@feature" }, () => {
  test("TC-CATEGORY-007 이름이 비었거나 공백뿐이면 저장되지 않는다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/category");
    await page.getByRole("button", { name: "추가", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "카테고리 추가" });
    const name = dialog.getByLabel("카테고리 이름");

    await name.fill("   ");
    await expect(dialog.getByRole("button", { name: "저장" })).toBeDisabled();
    await name.press("Enter");
    await expect(page.getByText("카테고리 이름을 입력해 주세요.")).toBeVisible();

    // 색만 바꾸면 저장은 눌리지만 이름이 없어 만들어지지 않는다
    await name.fill("");
    await dialog.getByRole("button", { name: "색상 선택" }).click();
    await dialog.getByRole("button", { name: "blue" }).click();
    await dialog.getByRole("button", { name: "저장" }).click();
    await expect(dialog).toBeVisible();

    await name.fill("가".repeat(21));
    await expect(name).toHaveValue("가".repeat(20));
    await page.keyboard.press("Escape");
    await page.getByRole("dialog", { name: "수정 중인 내용이 있습니다" }).getByRole("button", { name: "닫기" }).click();
    await expect(page.getByText("진행중인 카테고리가 없습니다.")).toBeVisible();
  });

  test("TC-CATEGORY-010 저장을 연달아 눌러도 하나만 만들어진다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/category");
    // 저장이 끝나기 전에 다시 누를 틈을 만든다
    await page.route("**/documents:commit*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      await route.fallback();
    });
    await page.getByRole("button", { name: "추가", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "카테고리 추가" });
    await dialog.getByLabel("카테고리 이름").fill("공부");
    await dialog.getByRole("button", { name: "저장" }).dblclick();
    await expect(dialog.getByRole("button", { name: "저장 중..." })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await waitForSaved(page);
    await page.reload();
    await expect(page.getByRole("button", { name: "공부 카테고리 메뉴 열기", exact: true })).toHaveCount(1);
  });

  test("TC-CATEGORY-011 수정 중에 닫으려 하면 확인을 묻는다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "A" });
    await page.goto("/category");
    const detail = page.getByRole("dialog", { name: "카테고리 상세" });
    const edit = page.getByRole("dialog", { name: "카테고리 수정" });
    const guard = page.getByRole("dialog", { name: "수정 중인 내용이 있습니다" });

    // 공백만 덧붙인 것은 고친 것이 아니라 묻지 않는다
    await openMenu(page, "A");
    await detail.getByRole("button", { name: "수정" }).click();
    await edit.getByLabel("카테고리 이름").fill("A  ");
    await page.keyboard.press("Escape");
    await expect(guard).toHaveCount(0);
    await expect(detail).toBeVisible();

    await detail.getByRole("button", { name: "수정" }).click();
    await edit.getByLabel("카테고리 이름").fill("새 이름");
    await page.mouse.click(5, 5);
    await expect(guard).toBeVisible();
    await guard.getByRole("button", { name: "닫기" }).click();
    // 상세에서 들어온 수정은 버리면 상세로 돌아간다
    await expect(detail).toBeVisible();
    await expect(detail.getByLabel("카테고리 이름")).toHaveValue("A");
  });
});

test.describe("카테고리: 저장 실패", { tag: "@feature" }, () => {
  test.use({ expectedError: /status of 500|Internal Server Error/ });

  test("TC-CATEGORY-008 저장에 실패하면 알리고 모달이 남는다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "A" });
    await page.goto("/category");
    await expect(page.getByRole("button", { name: "A 카테고리 메뉴 열기", exact: true })).toBeVisible();
    await waitForSaved(page);
    await failWrites(page);

    await createCategory(page, "B");
    await expect(page.getByText("카테고리 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "카테고리 추가" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog", { name: "수정 중인 내용이 있습니다" }).getByRole("button", { name: "닫기" }).click();

    await openMenu(page, "A");
    const detail = page.getByRole("dialog", { name: "카테고리 상세" });
    await detail.getByRole("button", { name: "수정" }).click();
    const edit = page.getByRole("dialog", { name: "카테고리 수정" });
    await edit.getByLabel("카테고리 이름").fill("A2");
    await edit.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("카테고리 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(edit).toBeVisible();
    // 취소는 버리겠다는 뜻이 분명해 묻지 않고 상세로 돌아간다
    await edit.getByRole("button", { name: "취소" }).click();

    await detail.getByRole("button", { name: "종료", exact: true }).click();
    await page.getByRole("dialog", { name: "카테고리를 종료할까요?" }).getByRole("button", { name: "종료" }).click();
    await expect(page.getByText("카테고리 종료에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(detail).toBeVisible();
    await expect.poll(() => activeNames(page)).toEqual(["A"]);
  });

  test("TC-CATEGORY-009 순서 저장에 실패하면 원래 순서로 돌아간다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    for (const [orderIndex, name] of ["A", "B", "C"].entries()) await seed.category({ name, orderIndex });
    await page.goto("/category");
    await expect.poll(() => activeNames(page)).toEqual(["A", "B", "C"]);
    await failWrites(page);

    await dragTo(page, page.getByText("C", { exact: true }), page.getByText("A", { exact: true }));
    await expect(page.getByText("순서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect.poll(() => activeNames(page)).toEqual(["A", "B", "C"]);
  });
});

test.describe("카테고리: 빈 상태와 읽기 실패", { tag: "@feature" }, () => {
  test("TC-CATEGORY-012 첫 사용자에게 빈 화면 안내가 보인다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/category");
    await expect(page.getByText("진행중인 카테고리가 없습니다.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "종료된 카테고리" })).toHaveCount(0);
    await page.getByRole("button", { name: "카테고리 추가", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "카테고리 추가" })).toBeVisible();
  });

  test.describe(() => {
    test.use({ expectedError: /status of 500|Internal Server Error/ });

    test("TC-CATEGORY-013 목록을 읽지 못하면 다시 시도할 수 있다", async ({ page, signIn }) => {
      const { seed } = await signIn();
      await seed.category({ name: "A" });
      // 첫 조회와 자동 재시도 한 번을 모두 실패시킨다
      let failures = 0;
      // 사용자 데이터 조회는 .../documents/users/{uid}:runQuery 로 나간다
      await page.route("**/*:runQuery*", (route) => {
        if (failures < 2 && route.request().postData()?.includes('"categories"')) {
          failures += 1;
          return route.fulfill({ status: 500, body: "{}" });
        }
        return route.fallback();
      });
      await page.goto("/category");
      await expect(page.getByText("카테고리를 불러오지 못했습니다.").first()).toBeVisible();
      await page.getByRole("button", { name: "다시 시도" }).first().click();
      await expect(page.getByRole("button", { name: "A 카테고리 메뉴 열기", exact: true })).toBeVisible();
    });
  });
});

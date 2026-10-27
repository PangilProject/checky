import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { dragTo } from "../../drag";
import { failWrites, waitForSaved } from "../../network";

// 10월 21일(수). 그 주는 10월 18일(일)~24일(토)
test.use({ today: "2026-10-21" });

const createDialog = (page: Page) => page.getByRole("dialog", { name: "루틴 추가" });
const openCreate = async (page: Page) => {
  await page.getByRole("button", { name: "추가", exact: true }).click();
  return createDialog(page);
};
const routineNames = (page: Page) =>
  page.getByLabel(/ 기록 보기$/).evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("aria-label")!.replace(/ 기록 보기$/, "")),
  );
const openDetail = async (page: Page, title: string) => {
  await page.getByRole("button", { name: `${title} 상세 보기`, exact: true }).click();
  return page.getByRole("dialog", { name: "루틴 상세" });
};

test.describe("루틴: 만들기", { tag: "@feature" }, () => {
  test("TC-ROUTINE-005 이름이나 요일 없이 저장하면 알리고 만들지 않는다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "건강" });
    await page.goto("/routine");
    const dialog = await openCreate(page);

    await dialog.getByRole("button", { name: "월", exact: true }).click();
    await dialog.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("루틴 이름을 입력해 주세요.")).toBeVisible();

    await dialog.getByRole("button", { name: "월", exact: true }).click();
    await dialog.getByLabel("루틴명").fill("독서");
    await dialog.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("반복할 요일을 하나 이상 선택해 주세요.")).toBeVisible();
    await expect(dialog).toBeVisible();
    expect(await routineNames(page)).toEqual([]);
  });

  test("TC-ROUTINE-006 시작일을 종료일보다 뒤로 옮기면 종료일이 따라간다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "건강" });
    await page.goto("/routine");
    const dialog = await openCreate(page);

    await dialog.getByRole("button", { name: "종료 날짜 추가" }).click();
    await dialog.getByRole("button", { name: /^종료 날짜 (선택|\d)/ }).click();
    await page.getByRole("button", { name: "2026년 10월 25일" }).click();
    await expect(dialog.getByRole("button", { name: "종료 날짜 2026. 10. 25." })).toBeVisible();

    await dialog.getByRole("button", { name: /^시작 날짜 / }).click();
    await page.getByRole("button", { name: "2026년 10월 28일" }).click();
    await expect(dialog.getByRole("button", { name: "종료 날짜 2026. 10. 28." })).toBeVisible();

    // 시작일보다 앞선 날은 종료일로 고를 수 없다
    await dialog.getByRole("button", { name: /^종료 날짜 (선택|\d)/ }).click();
    await expect(page.getByRole("button", { name: "2026년 10월 27일" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "2026년 10월 28일" })).toBeEnabled();
  });

  test("TC-ROUTINE-008 저장을 연타해도 루틴은 하나만 생긴다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "건강" });
    await page.goto("/routine");
    const dialog = await openCreate(page);
    await dialog.getByRole("button", { name: "월", exact: true }).click();
    await dialog.getByLabel("루틴명").fill("독서");
    // 첫 Enter 로 모달이 닫혀도 이어 누른 키가 저장을 한 번 더 부르지 않아야 한다
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await waitForSaved(page);
    await page.reload();
    await expect(page.getByRole("button", { name: "독서 기록 보기", exact: true })).toHaveCount(1);
  });

  test("TC-ROUTINE-014 카테고리가 없으면 만들러 갈 수 있다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/routine");
    await expect(page.getByText("아직 카테고리가 없습니다.")).toBeVisible();
    await page.getByRole("link", { name: "카테고리 만들러 가기" }).click();
    await expect(page).toHaveURL(/\/category$/);
  });
});

test.describe("루틴: 고치기와 지우기", { tag: "@feature" }, () => {
  test("TC-ROUTINE-009 종료일을 지난 날로 정하면 [종료] 가 붙는다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    await page.goto("/routine");

    const detail = await openDetail(page, "독서");
    await detail.getByRole("button", { name: "수정" }).click();
    const edit = page.getByRole("dialog", { name: "루틴 수정" });
    await edit.getByRole("button", { name: "종료 날짜 추가" }).click();
    await edit.getByRole("button", { name: /^종료 날짜 (선택|\d)/ }).click();
    await page.getByRole("button", { name: "2026년 10월 20일" }).click();
    await edit.getByRole("button", { name: "저장" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await expect(page.getByRole("button", { name: "독서 기록 보기", exact: true })).toContainText("[종료]");
    await page.getByRole("button", { name: "독서 기록 보기", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "독서" })).toContainText("10월 20일에 끝남");
    await page.keyboard.press("Escape");

    await waitForSaved(page);
    await page.getByRole("link", { name: "홈", exact: true }).click();
    await expect(page.getByRole("button", { name: "독서 10월 20일", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "독서 10월 21일", exact: true })).toHaveCount(0);
  });

  test("TC-ROUTINE-010 삭제하면 루틴·홈·기록 모두에서 사라진다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    await seed.routine({ title: "산책", categoryId: category.id, orderIndex: 1, startDate: "2026-10-01" });
    // 홈과 기록을 먼저 열어 캐시에 남긴다
    await page.goto("/home");
    await expect(page.getByRole("button", { name: "독서 10월 21일", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "기록", exact: true }).click();
    await expect(page.getByRole("button", { name: "독서 기록 보기", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "루틴", exact: true }).click();
    await expect(page.getByRole("heading", { name: "건강" })).toBeVisible();

    const detail = await openDetail(page, "독서");
    const confirm = page.getByRole("dialog", { name: "루틴을 삭제할까요?" });
    await detail.getByRole("button", { name: "삭제", exact: true }).click();
    await expect(confirm).toContainText("수행 기록도 함께 삭제");
    await confirm.getByRole("button", { name: "취소" }).click();
    await expect(detail).toBeVisible();
    await detail.getByRole("button", { name: "삭제", exact: true }).click();
    await confirm.getByRole("button", { name: "삭제" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await routineNames(page)).toEqual(["산책"]);

    await waitForSaved(page);
    await page.getByRole("link", { name: "홈", exact: true }).click();
    await expect(page.getByRole("button", { name: "산책 10월 21일", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "독서 10월 21일", exact: true })).toHaveCount(0);
    await page.getByRole("link", { name: "기록", exact: true }).click();
    await expect(page.getByRole("button", { name: "산책 기록 보기", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "독서 기록 보기", exact: true })).toHaveCount(0);
  });

  test("TC-ROUTINE-011 수정 중에 닫으려 하면 확인을 묻는다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    await page.goto("/routine");
    const guard = page.getByRole("dialog", { name: "수정 중인 내용이 있습니다" });

    // 작성 중 Esc → 버리면 모달이 닫힌다
    const create = await openCreate(page);
    await create.getByLabel("루틴명").fill("새 루틴");
    await page.keyboard.press("Escape");
    await guard.getByRole("button", { name: "닫기" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // 상세에서 들어간 수정은 고친 게 없으면 저장이 막혀 있고, 버리면 상세로 돌아간다
    const detail = await openDetail(page, "독서");
    await detail.getByRole("button", { name: "수정" }).click();
    const edit = page.getByRole("dialog", { name: "루틴 수정" });
    await expect(edit.getByRole("button", { name: "저장" })).toBeDisabled();
    await edit.getByLabel("루틴명").fill("독서 30분");
    await page.mouse.click(5, 5);
    await guard.getByRole("button", { name: "닫기" }).click();
    await expect(detail).toBeVisible();
    await expect(detail.getByLabel("루틴명")).toHaveValue("독서");
  });

  test("TC-ROUTINE-012 요일을 그대로 두고 수정하면 시작일이 잠긴다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
    await page.goto("/routine");
    const detail = await openDetail(page, "독서");
    await detail.getByRole("button", { name: "수정" }).click();
    const edit = page.getByRole("dialog", { name: "루틴 수정" });

    await expect(edit.getByText("2026-10-01")).toBeVisible();
    await expect(edit.getByRole("button", { name: /^시작 날짜/ })).toHaveCount(0);

    await edit.getByRole("button", { name: "토", exact: true }).click();
    const effective = edit.getByRole("button", { name: /^변경 적용 날짜/ });
    await expect(effective).toBeVisible();
    await effective.click();
    // 루틴이 시작하기 전부터 새 요일을 적용할 수는 없다
    await expect(page.getByRole("button", { name: "2026년 9월 30일" })).toBeDisabled();
    // Esc 는 선택기만 닫고 수정 모달은 그대로 둔다
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "2026년 9월 30일" })).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "수정 중인 내용이 있습니다" })).toHaveCount(0);
    await expect(edit).toBeVisible();

    await edit.getByRole("button", { name: "토", exact: true }).click();
    await expect(effective).toHaveCount(0);
    await expect(edit.getByText("2026-10-01")).toBeVisible();
  });

  test("TC-ROUTINE-013 기록 창에서 기간을 바꾸고 루틴 정보로 간다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "건강" });
    await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-15" });
    await page.goto("/routine");
    await page.getByRole("button", { name: "독서 기록 보기", exact: true }).click();
    const history = page.getByRole("dialog", { name: "독서" });

    // 15일~21일 7번 중 0번
    await expect(history).toContainText(/해야 했던 7번 중\s*0번\s*했어요/);
    await expect(history.getByRole("img", { name: "10월 15일 못 함" })).toBeVisible();
    await expect(history.getByRole("img", { name: /^10월 14일/ })).toHaveCount(0);

    await history.getByRole("button", { name: "3개월" }).click();
    await expect(history.getByRole("img", { name: "10월 15일 못 함" })).toBeVisible();

    await history.getByRole("button", { name: "루틴 정보" }).click();
    await expect(page.getByRole("dialog", { name: "루틴 상세" })).toBeVisible();
  });
});

test.describe("루틴: 실패", { tag: "@feature" }, () => {
  test.use({ expectedError: /status of 500|Internal Server Error/ });

  test("TC-ROUTINE-007 저장에 실패하면 알리고 입력이 남는다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "건강" });
    await page.goto("/routine");
    await expect(page.getByRole("heading", { name: "건강" })).toBeVisible();
    await waitForSaved(page);
    await failWrites(page);

    const dialog = await openCreate(page);
    await dialog.getByLabel("루틴명").fill("독서");
    await dialog.getByRole("button", { name: "월", exact: true }).click();
    await dialog.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("루틴 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(dialog.getByLabel("루틴명")).toHaveValue("독서");
    await expect(dialog.getByRole("button", { name: "월", pressed: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "저장" })).toBeEnabled();
  });

  test(
    "TC-ROUTINE-015 순서 저장에 실패하면 서버 순서로 돌아온다",
    { tag: "@regression", annotation: { type: "출처", description: "58f466b" } },
    async ({ page, signIn }) => {
      const { seed } = await signIn();
      const category = await seed.category({ name: "건강" });
      for (const [orderIndex, title] of ["A", "B", "C"].entries()) {
        await seed.routine({ title, categoryId: category.id, orderIndex, startDate: "2026-10-01" });
      }
      await page.goto("/routine");
      await expect.poll(() => routineNames(page)).toEqual(["A", "B", "C"]);
      await waitForSaved(page);
      await failWrites(page);

      await dragTo(page, page.getByLabel("C 기록 보기"), page.getByLabel("A 기록 보기"));
      await expect(page.getByText("순서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
      await expect.poll(() => routineNames(page)).toEqual(["A", "B", "C"]);
    },
  );
});

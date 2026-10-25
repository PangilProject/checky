import { test, expect } from "../../fixtures";
import { failWrites, waitForSaved } from "../../network";

// 10월 21일(수). 그 주는 10월 18일(일)~24일(토)
test.use({ today: "2026-10-21" });

const subtitle = (done: number, total: number) => `2026년 10월 21일 · ${done} / ${total} 완료`;
const calendarDay = (remaining: number) => ({ name: `10월 21일, 남은 일 ${remaining}개` });

test.describe("홈: 할 일", { tag: "@feature" }, () => {
  test("TC-HOME-002 할 일을 추가하면 목록·개수·캘린더 숫자가 함께 바뀐다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    await seed.category({ name: "업무" });
    await page.goto("/home");

    await page.getByRole("button", { name: "업무에 할 일 추가" }).click();
    await page.getByLabel("할 일 입력").fill("보고서");
    await page.getByLabel("할 일 입력").press("Enter");

    const check = async () => {
      await expect(page.getByRole("checkbox", { name: "보고서" })).toBeVisible();
      await expect(page.getByText(subtitle(0, 1))).toBeVisible();
      await expect(page.getByRole("button", calendarDay(1))).toBeVisible();
    };
    await check();
    await waitForSaved(page);
    await page.reload();
    await check();
  });

  test("TC-HOME-003 완료 체크가 부제·캘린더·달성 현황에 반영된다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "A", category, date: "2026-10-21", orderIndex: 0 });
    await seed.task({ title: "B", category, date: "2026-10-21", orderIndex: 1 });
    await page.goto("/home");

    const a = page.getByRole("checkbox", { name: "A", exact: true });
    const achievement = page.getByText(/해냈어요/);
    await expect(page.getByRole("button", calendarDay(2))).toBeVisible();

    await a.click();
    const checked = async () => {
      await expect(a).toBeChecked();
      await expect(page.getByText(subtitle(1, 2))).toBeVisible();
      await expect(page.getByRole("button", calendarDay(1))).toBeVisible();
      await expect(achievement).toHaveText(/2개 중\s*1개\s*해냈어요/);
    };
    await checked();
    await waitForSaved(page);
    await page.reload();
    await checked();

    await a.click();
    await expect(a).not.toBeChecked();
    await expect(page.getByText(subtitle(0, 2))).toBeVisible();
    await expect(page.getByRole("button", calendarDay(2))).toBeVisible();
  });

  test("TC-HOME-006 할 일 상세에서 수정·삭제한다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "보고서", category, date: "2026-10-21" });
    await page.goto("/home");

    // 수정
    await page.getByRole("button", { name: "보고서 상세 보기", exact: true }).click();
    await page.getByRole("dialog", { name: "태스크 상세" }).getByRole("button", { name: "수정" }).click();
    const edit = page.getByRole("dialog", { name: "태스크 수정" });
    await edit.getByLabel("할 일 내용").fill("");
    await edit.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("할 일 내용을 입력해 주세요.")).toBeVisible();
    await edit.getByLabel("할 일 내용").fill("주간 보고서");
    await edit.getByRole("button", { name: "저장" }).click();
    await expect(page.getByRole("checkbox", { name: "주간 보고서" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // 삭제: 확인 창에서 취소하면 그대로, 삭제하면 사라진다
    await page.getByRole("button", { name: "주간 보고서 상세 보기", exact: true }).click();
    const detail = page.getByRole("dialog", { name: "태스크 상세" });
    const confirm = page.getByRole("dialog", { name: "할 일을 삭제할까요?" });
    await detail.getByRole("button", { name: "삭제", exact: true }).click();
    await confirm.getByRole("button", { name: "취소" }).click();
    await expect(confirm).toHaveCount(0);
    await expect(detail).toBeVisible();

    await detail.getByRole("button", { name: "삭제", exact: true }).click();
    await confirm.getByRole("button", { name: "삭제" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "주간 보고서" })).toHaveCount(0);
    await expect(page.getByRole("button", calendarDay(1))).toHaveCount(0);
  });
});

test.describe("홈: 저장 실패", { tag: "@feature" }, () => {
  // 쓰기를 막으면 브라우저와 Firestore 가 콘솔에 실패를 남긴다
  test.use({ expectedError: /status of 500|Internal Server Error/ });

  test("TC-HOME-005 할 일 저장에 실패하면 되돌리고 알린다", async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    await seed.task({ title: "기존 할 일", category, date: "2026-10-21" });
    await page.goto("/home");
    await expect(page.getByRole("checkbox", { name: "기존 할 일" })).toBeVisible();
    await waitForSaved(page);
    await failWrites(page);

    // 추가 실패
    await page.getByRole("button", { name: "업무에 할 일 추가" }).click();
    await page.getByLabel("할 일 입력").fill("새 할 일");
    await page.getByLabel("할 일 입력").press("Enter");
    await expect(page.getByText("할 일 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "새 할 일" })).toHaveCount(0);
    await expect(page.getByRole("button", calendarDay(1))).toBeVisible();

    // 완료 체크 실패
    const existing = page.getByRole("checkbox", { name: "기존 할 일" });
    await existing.click();
    await expect(page.getByText("완료 상태를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    await expect(existing).not.toBeChecked();
  });
});

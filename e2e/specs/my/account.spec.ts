import { test, expect } from "../../fixtures";
import { inspect } from "../../emulator";

test.use({ today: "2026-10-21" });

test.describe("마이: 계정", { tag: "@feature" }, () => {
  test(
    "TC-MY-001 탈퇴하면 계정과 데이터가 모두 지워진다",
    { tag: "@regression", annotation: { type: "출처", description: "3e54175, ab12329" } },
    async ({ page, signIn }) => {
      // 사용자 아래 여섯 컬렉션을 모두 채운다. 하나라도 비어 있으면 그 컬렉션을 지우지 않는 회귀를 놓친다
      const { uid, email, seed } = await signIn();
      const category = await seed.category({ name: "건강" });
      const routine = await seed.routine({ title: "독서", categoryId: category.id, orderIndex: 0, startDate: "2026-10-01" });
      await seed.routineLog({ routineId: routine.id, date: "2026-10-21", done: true });
      const task = await seed.task({ title: "보고서", category, date: "2026-10-21" });
      await seed.taskLog({ taskId: task.id, date: "2026-10-21", completed: true });
      // 월간 통계는 홈이 처음 열릴 때 만든다
      await page.goto("/home");
      await expect(page.getByRole("button", { name: /^10월 21일, 남은 일/ })).toBeVisible();
      await expect
        .poll(async () => (await inspect.userCollections(uid)).sort())
        .toEqual(["categories", "monthlyStats", "routineLogs", "routines", "taskLogs", "tasks"]);
      await page.getByRole("link", { name: "마이", exact: true }).click();

      await page.getByRole("button", { name: "회원탈퇴" }).click();
      const popupPromise = page.waitForEvent("popup");
      await page.getByRole("dialog", { name: "정말로 탈퇴하시겠습니까?" }).getByRole("button", { name: "탈퇴" }).click();
      // 본인 확인은 에뮬레이터가 띄우는 계정 선택 창에서 같은 계정을 고르는 것으로 대신한다
      const popup = await popupPromise;
      // 계정 선택 창은 목록을 불러온 뒤 다시 그려, 그 전에 누르면 강조만 되고 넘어가지 않는다.
      // 창이 닫힐 때까지 다시 누른다. 에뮬레이터의 모든 계정이 나오므로 이 테스트의 계정을 이메일로 고른다
      await popup.waitForLoadState("networkidle");
      await expect(async () => {
        if (popup.isClosed()) return;
        // 행 전체가 클릭을 받으므로 글자가 아니라 행을 누른다
        await popup.getByRole("listitem").filter({ hasText: email }).click({ timeout: 2_000 });
        await popup.waitForEvent("close", { timeout: 2_000 });
      }).toPass({ timeout: 15_000 });

      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByText("회원탈퇴가 완료되었습니다.")).toBeVisible();
      expect(await inspect.userDoc(uid)).toBeNull();
      expect(await inspect.userCollections(uid)).toEqual([]);
      expect(await inspect.authUserExists(uid)).toBe(false);
    },
  );

  test("TC-MY-002 본인 확인 창을 닫으면 탈퇴가 진행되지 않는다", async ({ page, signIn }) => {
    const { uid, seed } = await signIn();
    await seed.category({ name: "건강" });
    await page.goto("/my");

    await page.getByRole("button", { name: "회원탈퇴" }).click();
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("dialog", { name: "정말로 탈퇴하시겠습니까?" }).getByRole("button", { name: "탈퇴" }).click();
    const popup = await popupPromise;
    await popup.close();

    // SDK 가 창이 닫힌 것을 알아채기까지 몇 초 걸린다
    await expect(page.getByText("본인 확인이 취소되었습니다. 탈퇴가 진행되지 않았습니다.")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/my$/);
    expect(await inspect.authUserExists(uid)).toBe(true);
    await page.getByRole("link", { name: "카테고리", exact: true }).click();
    await expect(page.getByRole("button", { name: "건강 카테고리 메뉴 열기", exact: true })).toBeVisible();
  });

  test("TC-MY-003 로그아웃하면 보호된 화면에 다시 들어갈 수 없다", async ({ page, signIn }) => {
    await signIn();
    await page.goto("/home");
    await page.getByRole("link", { name: "마이", exact: true }).click();
    await page.getByRole("button", { name: "로그아웃" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("로그아웃 되었습니다.")).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/my");
    await expect(page).toHaveURL(/\/login$/);
  });

  test(
    "TC-MY-004 다른 계정으로 다시 로그인하면 이전 계정의 데이터가 보이지 않는다",
    { tag: "@regression", annotation: { type: "출처", description: "3e54175" } },
    async ({ page, signIn }) => {
      const a = await signIn();
      await a.seed.category({ name: "A전용" });
      await page.goto("/category");
      await expect(page.getByRole("button", { name: "A전용 카테고리 메뉴 열기", exact: true })).toBeVisible();
      await page.getByRole("link", { name: "마이", exact: true }).click();
      await page.getByRole("button", { name: "로그아웃" }).click();
      await expect(page).toHaveURL(/\/login$/);

      // 새로고침하면 메모리 캐시가 사라져 버그가 가려진다. 같은 탭에서 그대로 다른 계정으로 들어간다
      const b = await signIn({ inPlace: true });
      expect(b.uid).not.toBe(a.uid);
      await expect(page).toHaveURL(/\/home$/);
      await page.getByRole("link", { name: "카테고리", exact: true }).click();
      await expect(page.getByText("진행중인 카테고리가 없습니다.")).toBeVisible();
      await expect(page.getByText("A전용")).toHaveCount(0);
    },
  );
});

test(
  "TC-COMMON-001 처음 로그인하면 프로필 문서가 자동으로 생긴다",
  { tag: "@regression", annotation: { type: "출처", description: "de153af" } },
  async ({ page, signIn }) => {
    const { uid } = await signIn();
    expect(await inspect.userDoc(uid)).toBeNull();
    await page.goto("/home");
    await expect(page.getByRole("heading", { name: "달성 현황" })).toBeVisible();

    await expect.poll(() => inspect.userDoc(uid)).not.toBeNull();
    const profile = (await inspect.userDoc(uid))!;
    expect(profile).toHaveProperty("uid", { stringValue: uid });
    expect(profile).toHaveProperty("name", { stringValue: "E2E 사용자" });
    expect(profile).not.toHaveProperty("isAdmin");
  },
);

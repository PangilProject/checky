import { test, expect } from "../../fixtures";
import { grab } from "../../drag";

test.use({ today: "2026-10-21" });

test(
  "TC-HOME-001 완료한 할 일을 끄는 동안 체크 표시가 유지된다",
  { tag: "@regression", annotation: { type: "출처", description: "e6f45d5" } },
  async ({ page, signIn }) => {
    const { seed } = await signIn();
    const category = await seed.category({ name: "업무" });
    const task = await seed.task({ title: "보고서 쓰기", category, date: "2026-10-21" });
    await seed.taskLog({ taskId: task.id, date: "2026-10-21", completed: true });

    await page.goto("/home");
    await page.getByRole("button", { name: "한 주", exact: true }).click();

    const hand = await grab(page, page.getByLabel("보고서 쓰기 (완료)"));
    await hand.moveTo(page.getByRole("region", { name: "10월 22일" }));

    const preview = page.getByTestId("task-drag-preview");
    await expect(preview.getByText("보고서 쓰기")).toHaveCSS("text-decoration-line", "line-through");

    await hand.drop();
    await expect(
      page.getByRole("region", { name: "10월 22일" }).getByLabel(/^보고서 쓰기/),
    ).toBeVisible();
  },
);

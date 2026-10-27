import { test } from "../fixtures";

/**
 * 클릭으로 테스트 만들기. `npm run e2e:record` 로 연다.
 *
 * 새 테스트 사용자로 로그인하고 예시 데이터를 넣은 뒤 멈춘다. 뜨는 Playwright Inspector 에서
 * Record 를 누르고 화면을 조작하면 그 조작이 테스트 코드로 쌓인다. 끝나면 Inspector 의 코드를
 * 복사해 케이스 파일(e2e/cases)과 함께 넘기거나 spec 에 붙인다. 창을 닫으면 끝난다.
 */
test("녹화", async ({ page, signIn }) => {
  const { seed } = await signIn();
  const work = await seed.category({ name: "업무", color: "#0088FF", orderIndex: 0 });
  const health = await seed.category({ name: "건강", color: "#35C759", orderIndex: 1 });
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  await seed.task({ title: "보고서 쓰기", category: work, date: today, orderIndex: 0 });
  await seed.task({ title: "메일 답장", category: work, date: today, orderIndex: 1 });
  await seed.routine({ title: "스트레칭", categoryId: health.id, orderIndex: 0, startDate: `${today.slice(0, 7)}-01` });
  await seed.routine({ title: "독서", categoryId: health.id, orderIndex: 1, startDate: `${today.slice(0, 7)}-01`, days: [1, 3, 5] });

  await page.goto("/home");
  await page.pause();
});

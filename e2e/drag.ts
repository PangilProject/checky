import { expect, type Locator, type Page } from "@playwright/test";

/**
 * dnd-kit 끌기를 사람 손처럼 재현한다.
 *
 * 앱은 150ms 이상 눌러야 끌기로 본다(SortableList·TaskWeekBoard 의 ACTIVATION_CONSTRAINT).
 * locator.dragTo() 는 누르자마자 움직여 짧은 누르기로 처리되므로 쓰지 않는다.
 * 누른 채로 끌기가 실제로 시작될 때까지 기다린 뒤 움직인다.
 *
 * 끄는 도중의 화면을 확인할 수 있게 집기·옮기기·놓기를 나눠 둔다.
 */
export const grab = async (page: Page, source: Locator) => {
  // 좁은 화면에서는 대상이 화면 밖에 있거나, 위쪽이 늦게 그려지며 밀려난다
  await source.scrollIntoViewIfNeeded();
  const from = await center(source);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  // 끌기가 시작되면 dnd-kit 이 끌리는 항목에 aria-pressed="true" 를 단다. 시간을 정해 두고 기다리면
  // 부하가 클 때 앱의 150ms 타이머가 늦게 돌아, 시작되기 전에 움직여 끌기가 취소된다
  const handle = source.locator("xpath=ancestor-or-self::*[@aria-roledescription][1]");
  await expect(handle).toHaveAttribute("aria-pressed", "true");

  return {
    moveTo: async (target: Locator) => {
      const to = await center(target);
      await page.mouse.move(to.x, to.y, { steps: 12 });
    },
    drop: () => page.mouse.up(),
  };
};

export const dragTo = async (page: Page, source: Locator, target: Locator) => {
  const hand = await grab(page, source);
  await hand.moveTo(target);
  await hand.drop();
};

/** 위치가 두 번 연달아 같게 잡힐 때까지 잰다. 재는 사이에 화면이 밀리면 엉뚱한 곳을 누른다 */
const center = async (locator: Locator) => {
  let previous = "";
  for (let attempt = 0; attempt < 20; attempt++) {
    const box = await locator.boundingBox();
    if (!box) throw new Error(`화면에 보이지 않아 끌 수 없습니다: ${locator}`);
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const key = `${point.x},${point.y}`;
    if (key === previous) return point;
    previous = key;
    await locator.page().waitForTimeout(50);
  }
  throw new Error(`위치가 계속 바뀌어 끌 수 없습니다: ${locator}`);
};

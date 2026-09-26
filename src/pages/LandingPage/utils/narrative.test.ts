import { describe, expect, it } from "vitest";
import { DEMO_LAST_DAY, DEMO_ROUTINES, DEMO_TODAY, HERO_ITEM_ID } from "../constants/demoData";
import { STORY_LENGTH, TIMELINE_LENGTH, at } from "../constants/scenes";
import {
  MARKS,
  getCheckDraw,
  getMonthFilledUntil,
  getNight,
  getWeekFilledUntil,
  isHeroChecked,
  weekCheckedAt,
} from "./narrative";

describe("getNight", () => {
  it("밤에 시작해 브랜드가 드러나며 아침이 된다", () => {
    expect(getNight(0, false)).toBe(1);
    expect(getNight(at("enter", 0), false)).toBe(0);
  });

  it("한 달을 마무리하며 다시 밤이 된다", () => {
    expect(getNight(STORY_LENGTH - 1, false)).toBe(1);
  });

  it("이야기가 끝나면 방문자의 테마로 돌아간다", () => {
    expect(getNight(TIMELINE_LENGTH, false)).toBe(0);
    expect(getNight(TIMELINE_LENGTH, true)).toBe(1);
  });
});

describe("주인공 체크", () => {
  it("누르지 않으면 스크롤을 따라 저절로 그려진다 — 사용자를 막지 않는다", () => {
    expect(getCheckDraw(MARKS.autoDrawStart, false)).toBe(0);
    expect(isHeroChecked(MARKS.autoCheckAt, false)).toBe(true);
  });

  it("직접 눌렀으면 그 전이라도 체크된 채로 남는다", () => {
    expect(isHeroChecked(MARKS.focusEnd, true)).toBe(true);
    expect(isHeroChecked(0, true)).toBe(true);
  });
});

describe("주간 표와 달력", () => {
  it("요일은 일요일부터 토요일까지 채워진다", () => {
    expect(getWeekFilledUntil(MARKS.weekFillStart)).toBe(-1);
    expect(getWeekFilledUntil(MARKS.weekFillEnd)).toBe(6);
  });

  it("표가 생길 때부터 일요일의 물 한 잔만 체크돼 있다", () => {
    const checked = weekCheckedAt(MARKS.splitEnd);
    const sunday = DEMO_ROUTINES.filter((routine) => checked(routine, 0)).map((routine) => routine.id);
    expect(sunday).toEqual([HERO_ITEM_ID]);
  });

  it("달력은 이번 주가 채워진 뒤 월말까지 채워진다", () => {
    expect(getMonthFilledUntil(MARKS.weekFillEnd)).toBe(DEMO_TODAY + 6);
    expect(getMonthFilledUntil(MARKS.monthFillEnd)).toBe(DEMO_LAST_DAY);
  });
});

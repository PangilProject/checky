import { describe, expect, it } from "vitest";
import { moveDay, moveMonth, moveWeek } from "./dateNavigation";

describe("moveMonth", () => {
  it("1월 31일 +1달은 3월 3일이 아니라 2월이다 (setDate(1) 선행)", () => {
    const next = moveMonth(new Date(2026, 0, 31), 1);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(1);
  });

  it("12월 +1달은 다음 해 1월이다", () => {
    const next = moveMonth(new Date(2026, 11, 15), 1);
    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(0);
  });

  it("1월 -1달은 전 해 12월이다", () => {
    const next = moveMonth(new Date(2026, 0, 15), -1);
    expect(next.getFullYear()).toBe(2025);
    expect(next.getMonth()).toBe(11);
  });
});

describe("moveDay", () => {
  it("월 마지막 날 +1일은 다음 달 1일이다", () => {
    const next = moveDay(new Date(2026, 0, 31), 1);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(1);
  });

  it("12월 31일 +1일은 다음 해 1월 1일이다", () => {
    const next = moveDay(new Date(2026, 11, 31), 1);
    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(0);
    expect(next.getDate()).toBe(1);
  });

  it("윤년 2월 28일 +1일은 29일이다", () => {
    expect(moveDay(new Date(2024, 1, 28), 1).getDate()).toBe(29);
    expect(moveDay(new Date(2026, 1, 28), 1).getMonth()).toBe(2);
  });

  it("moveWeek 와 같은 자정으로 맞춘다", () => {
    const next = moveDay(new Date(2026, 7, 9, 23, 59), 1);
    expect(next.getHours()).toBe(0);
    expect(next.getMinutes()).toBe(0);
  });
});

describe("moveWeek", () => {
  it("항상 일요일 자정 기준이다", () => {
    // 2026-08-05 는 수요일 → 그 주 일요일은 2026-08-02
    const next = moveWeek(new Date(2026, 7, 5, 14, 30), 0);
    expect(next.getDay()).toBe(0);
    expect(next.getDate()).toBe(2);
    expect(next.getHours()).toBe(0);
  });

  it("+1주는 다음 주 일요일이다", () => {
    const next = moveWeek(new Date(2026, 7, 5), 1);
    expect(next.getDay()).toBe(0);
    expect(next.getDate()).toBe(9);
  });
});

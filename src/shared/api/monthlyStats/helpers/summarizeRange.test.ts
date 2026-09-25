import { describe, expect, it } from "vitest";
import { summarizeRange, toPercent } from "./summarizeRange";
import type { MonthlyStats } from "../types";

const split = (taskTotal: number, taskCompleted: number, routineTotal: number, routineCompleted: number) => ({
  total: taskTotal + routineTotal,
  completed: taskCompleted + routineCompleted,
  remaining: taskTotal + routineTotal - taskCompleted - routineCompleted,
  taskTotal,
  taskCompleted,
  routineTotal,
  routineCompleted,
});

const sept: MonthlyStats = {
  month: "2026-09",
  version: 2,
  days: {
    "24": split(2, 1, 3, 3),
    "25": split(3, 2, 2, 0),
    "26": split(1, 0, 2, 0),
  },
};

describe("summarizeRange", () => {
  it("기준일까지만 합계에 넣고 이후는 예정으로 센다", () => {
    const result = summarizeRange({
      statsByMonth: { "2026-09": sept },
      startDate: "2026-09-24",
      endDate: "2026-09-26",
      cutoffDate: "2026-09-25",
    });

    expect(result).toMatchObject({
      total: 10,
      completed: 6,
      taskTotal: 5,
      taskCompleted: 3,
      routineTotal: 5,
      routineCompleted: 3,
      upcoming: 3,
      hasSplit: true,
    });
    expect(result.days.map((day) => day.upcoming)).toEqual([false, false, true]);
  });

  it("두 달에 걸친 기간은 두 문서를 합친다", () => {
    const oct: MonthlyStats = {
      month: "2026-10",
      version: 2,
      days: { "01": split(1, 1, 1, 0) },
    };

    const result = summarizeRange({
      statsByMonth: { "2026-09": sept, "2026-10": oct },
      startDate: "2026-09-26",
      endDate: "2026-10-01",
      cutoffDate: "2026-10-01",
    });

    expect(result.total).toBe(5);
    expect(result.completed).toBe(1);
    expect(result.days).toHaveLength(6);
  });

  it("문서가 없는 달은 활동이 없는 것으로 본다", () => {
    const result = summarizeRange({
      statsByMonth: { "2026-09": null },
      startDate: "2026-09-01",
      endDate: "2026-09-03",
      cutoffDate: "2026-09-03",
    });

    expect(result.total).toBe(0);
    expect(result.hasSplit).toBe(true);
  });

  it("몫이 없는 옛 칸이 섞이면 hasSplit 이 false 다", () => {
    const legacy: MonthlyStats = {
      month: "2026-09",
      days: { "01": { total: 4, completed: 2, remaining: 2 } },
    };

    const result = summarizeRange({
      statsByMonth: { "2026-09": legacy },
      startDate: "2026-09-01",
      endDate: "2026-09-01",
      cutoffDate: "2026-09-01",
    });

    expect(result.total).toBe(4);
    expect(result.completed).toBe(2);
    expect(result.hasSplit).toBe(false);
  });

  it("완료가 전체를 넘는 칸은 전체로 자른다", () => {
    const broken: MonthlyStats = {
      month: "2026-09",
      days: { "01": { total: 2, completed: 5, remaining: 0 } },
    };

    const result = summarizeRange({
      statsByMonth: { "2026-09": broken },
      startDate: "2026-09-01",
      endDate: "2026-09-01",
      cutoffDate: "2026-09-01",
    });

    expect(result.completed).toBe(2);
  });

  it("날짜가 잘못되면 빈 결과다", () => {
    const result = summarizeRange({
      statsByMonth: {},
      startDate: "abc",
      endDate: "2026-09-01",
      cutoffDate: "2026-09-01",
    });

    expect(result.days).toEqual([]);
  });
});

describe("toPercent", () => {
  it("반올림한 백분율을 돌려준다", () => {
    expect(toPercent(2, 3)).toBe(67);
  });

  it("전체가 0 이면 null 이다", () => {
    expect(toPercent(0, 0)).toBeNull();
  });
});

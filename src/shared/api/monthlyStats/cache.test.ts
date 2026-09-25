import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { monthlyStatsKeys } from "@/shared/api/keys";
import { patchMonthlyStatsDayCache } from "./cache";
import type { MonthlyStats } from "./types";

const USER = "u1";
const MONTH = "2026-09";
const key = monthlyStatsKeys.byMonth(USER, MONTH);

const seed = (stats: MonthlyStats) => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(key, stats);
  return queryClient;
};

describe("patchMonthlyStatsDayCache", () => {
  it("몫이 나뉜 칸은 합산과 해당 몫을 함께 고친다", () => {
    const queryClient = seed({
      month: MONTH,
      version: 2,
      days: {
        "25": {
          total: 5,
          completed: 2,
          remaining: 3,
          taskTotal: 3,
          taskCompleted: 1,
          routineTotal: 2,
          routineCompleted: 1,
        },
      },
    });

    patchMonthlyStatsDayCache(queryClient, USER, MONTH, "25", 1, "routine");

    const day = queryClient.getQueryData<MonthlyStats>(key)?.days["25"];
    expect(day).toMatchObject({
      completed: 3,
      remaining: 2,
      taskCompleted: 1,
      routineCompleted: 2,
    });
  });

  it("몫 완료는 몫 전체를 넘거나 0 아래로 가지 않는다", () => {
    const queryClient = seed({
      month: MONTH,
      version: 2,
      days: {
        "25": {
          total: 2,
          completed: 2,
          remaining: 0,
          taskTotal: 1,
          taskCompleted: 1,
          routineTotal: 1,
          routineCompleted: 1,
        },
      },
    });

    patchMonthlyStatsDayCache(queryClient, USER, MONTH, "25", 1, "task");
    expect(
      queryClient.getQueryData<MonthlyStats>(key)?.days["25"].taskCompleted,
    ).toBe(1);

    patchMonthlyStatsDayCache(queryClient, USER, MONTH, "25", -1, "task");
    patchMonthlyStatsDayCache(queryClient, USER, MONTH, "25", -1, "task");
    expect(
      queryClient.getQueryData<MonthlyStats>(key)?.days["25"].taskCompleted,
    ).toBe(0);
  });

  it("몫이 없는 옛 칸에는 몫 필드를 만들지 않는다", () => {
    const queryClient = seed({
      month: MONTH,
      days: { "25": { total: 3, completed: 1, remaining: 2 } },
    });

    patchMonthlyStatsDayCache(queryClient, USER, MONTH, "25", 1, "task");

    const day = queryClient.getQueryData<MonthlyStats>(key)?.days["25"];
    expect(day).toEqual({
      total: 3,
      completed: 2,
      remaining: 1,
      hasActivity: true,
    });
  });
});

import { describe, expect, it } from "vitest";
import { buildRoutineDays, summarizeRoutineDays } from "./history";

// 2026-09-06 은 일요일이다
const routine = {
  id: "r1",
  startDate: "2026-09-07",
  days: [1, 3],
  scheduleHistory: [
    { effectiveFrom: "2026-09-07", days: [1, 3, 5] },
    { effectiveFrom: "2026-09-14", days: [1, 3] },
  ],
};

const log = (date: string, done = true) => ({ routineId: "r1", date, done });

describe("buildRoutineDays", () => {
  it("반복 요일 이력을 따라 했음·못 함·쉬는 날·기간 밖을 가른다", () => {
    const days = buildRoutineDays({
      routine,
      logs: [log("2026-09-07"), log("2026-09-11"), log("2026-09-09", false)],
      startDate: "2026-09-06",
      endDate: "2026-09-12",
      cutoffDate: "2026-09-12",
    });

    expect(days.map((day) => day.status)).toEqual([
      "outside", // 일 6: 시작 전
      "done", // 월 7
      "off", // 화 8
      "missed", // 수 9: 기록은 있지만 해제했다
      "off", // 목 10
      "done", // 금 11: 이때는 금요일도 반복했다
      "off", // 토 12
    ]);
  });

  it("기준일 뒤는 예정으로만 표시하고 세지 않는다", () => {
    const days = buildRoutineDays({
      routine,
      logs: [],
      startDate: "2026-09-14",
      endDate: "2026-09-18",
      cutoffDate: "2026-09-15",
    });

    expect(days.map((day) => day.status)).toEqual([
      "missed", // 월 14
      "off", // 화 15
      "upcoming", // 수 16
      "outside", // 목 17
      "outside", // 금 18: 바뀐 뒤라 반복하지 않는다
    ]);
  });

  it("다른 루틴의 기록은 세지 않는다", () => {
    const days = buildRoutineDays({
      routine,
      logs: [{ routineId: "other", date: "2026-09-07", done: true }],
      startDate: "2026-09-07",
      endDate: "2026-09-07",
      cutoffDate: "2026-09-07",
    });

    expect(days[0].status).toBe("missed");
  });
});

describe("summarizeRoutineDays", () => {
  it("합계와 요일별, 이력 구간별 횟수를 센다", () => {
    const days = buildRoutineDays({
      routine,
      logs: [log("2026-09-07"), log("2026-09-11"), log("2026-09-14")],
      startDate: "2026-09-06",
      endDate: "2026-09-19",
      cutoffDate: "2026-09-16",
    });
    const summary = summarizeRoutineDays({ routine, days });

    // 7 월, 9 수, 11 금, 14 월, 16 수
    expect(summary.total).toBe(5);
    expect(summary.done).toBe(3);
    expect(summary.byWeekday).toEqual([
      { day: 1, total: 2, done: 2 },
      { day: 3, total: 2, done: 0 },
      { day: 5, total: 1, done: 1 },
    ]);
    expect(summary.segments).toEqual([
      {
        from: "2026-09-07",
        until: "2026-09-13",
        days: [1, 3, 5],
        isCurrent: false,
        total: 3,
        done: 2,
      },
      {
        from: "2026-09-14",
        until: "2026-09-16",
        days: [1, 3],
        isCurrent: true,
        total: 2,
        done: 1,
      },
    ]);
  });
});

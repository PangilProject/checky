import { describe, expect, it } from "vitest";
import { getAchievementRanges } from "./getAchievementRanges";

// 2026-09-25 는 금요일이다
const TODAY = new Date(2026, 8, 25, 15, 30);

describe("getAchievementRanges", () => {
  it("이번 주는 일~토이고 오늘까지만 센다", () => {
    const result = getAchievementRanges({
      selectedDate: TODAY,
      mode: "week",
      today: TODAY,
    });

    expect(result.status).toBe("current");
    expect(result.period).toEqual({
      startDate: "2026-09-20",
      endDate: "2026-09-26",
      cutoffDate: "2026-09-25",
    });
    // 지난주는 같은 요일(금)까지만 비교한다
    expect(result.compare).toEqual({
      startDate: "2026-09-13",
      endDate: "2026-09-19",
      cutoffDate: "2026-09-18",
    });
    expect(result.months).toEqual(["2026-09"]);
  });

  it("두 달에 걸친 주는 두 달을 모두 읽는다", () => {
    const result = getAchievementRanges({
      selectedDate: new Date(2026, 8, 30),
      mode: "week",
      today: new Date(2026, 8, 30),
    });

    expect(result.period.startDate).toBe("2026-09-27");
    expect(result.period.endDate).toBe("2026-10-03");
    expect(result.months).toEqual(["2026-09", "2026-10"]);
  });

  it("이번 달은 1일부터 말일까지이고 지난달 같은 날짜까지 비교한다", () => {
    const result = getAchievementRanges({
      selectedDate: TODAY,
      mode: "month",
      today: TODAY,
    });

    expect(result.period).toEqual({
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      cutoffDate: "2026-09-25",
    });
    expect(result.compare).toEqual({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      cutoffDate: "2026-08-25",
    });
    expect(result.months).toEqual(["2026-08", "2026-09"]);
  });

  it("지난달이 더 짧으면 그 달 말일에서 멈춘다", () => {
    const march31 = new Date(2026, 2, 31);
    const result = getAchievementRanges({
      selectedDate: march31,
      mode: "month",
      today: march31,
    });

    expect(result.compare?.cutoffDate).toBe("2026-02-28");
  });

  it("지난 기간은 끝까지 세고 지난 기간 전체와 비교한다", () => {
    const result = getAchievementRanges({
      selectedDate: new Date(2026, 7, 10),
      mode: "month",
      today: TODAY,
    });

    expect(result.status).toBe("past");
    expect(result.period.cutoffDate).toBe("2026-08-31");
    expect(result.compare?.cutoffDate).toBe("2026-07-31");
  });

  it("아직 오지 않은 기간은 합계가 비고 비교도 없다", () => {
    const result = getAchievementRanges({
      selectedDate: new Date(2026, 9, 10),
      mode: "week",
      today: TODAY,
    });

    expect(result.status).toBe("future");
    expect(result.period.cutoffDate < result.period.startDate).toBe(true);
    expect(result.compare).toBeNull();
  });

  it("해를 넘는 주도 이어서 센다", () => {
    const result = getAchievementRanges({
      selectedDate: new Date(2026, 11, 31),
      mode: "week",
      today: new Date(2026, 11, 31),
    });

    expect(result.period.startDate).toBe("2026-12-27");
    expect(result.period.endDate).toBe("2027-01-02");
    expect(result.months).toEqual(["2026-12", "2027-01"]);
  });
});

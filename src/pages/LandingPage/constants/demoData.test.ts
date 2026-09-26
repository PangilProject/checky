import { describe, expect, it } from "vitest";
import {
  DEMO_CALENDAR,
  DEMO_MONTH_DAYS,
  DEMO_RATE,
  DEMO_SUMMARY,
  DEMO_TODAY,
  DEMO_WEEK,
  DEMO_WEEK_ROWS,
  DEMO_WEEK_ROW_INDEX,
  FULL_WEEK,
  demoDay,
  getWeekTotal,
} from "./demoData";

describe("예시 기록", () => {
  it("달력의 이번 주 숫자는 주간 표의 합계와 같은 규칙에서 나온다", () => {
    DEMO_WEEK.forEach((day, weekday) => {
      const routines = getWeekTotal(weekday, FULL_WEEK);
      const { total, completed, taskTotal, taskCompleted } = demoDay(day);
      expect(total - taskTotal).toBe(routines.total);
      expect(completed - taskCompleted).toBe(routines.done);
    });
  });

  it("주별 막대의 합은 한 달 요약과 같다", () => {
    expect(DEMO_WEEK_ROWS.reduce((sum, row) => sum + row.total, 0)).toBe(DEMO_SUMMARY.total);
    expect(DEMO_WEEK_ROWS.reduce((sum, row) => sum + row.completed, 0)).toBe(DEMO_SUMMARY.completed);
  });

  it("완벽한 기록처럼 보이지 않도록 못 한 날이 섞여 있다", () => {
    expect(DEMO_RATE).toBeLessThan(90);
    expect(DEMO_MONTH_DAYS.some((day) => day.completed < day.total)).toBe(true);
  });

  it("이번 주는 달력의 한 줄이다", () => {
    const row = DEMO_CALENDAR[DEMO_WEEK_ROW_INDEX];
    expect(row.map((slot) => slot.day)).toEqual(DEMO_WEEK);
    expect(row[0].day).toBe(DEMO_TODAY);
  });
});

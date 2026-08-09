import { describe, expect, it } from "vitest";
import type { Routine } from "@/shared/api/routine";
import { buildNextScheduleHistory, hasSameDays } from "./utils";

const makeRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "r1",
  title: "루틴",
  categoryId: "c1",
  days: [1],
  orderIndex: 0,
  startDate: "2026-01-01",
  ...overrides,
});

describe("hasSameDays", () => {
  it("순서가 달라도 같은 요일 집합이면 참이다", () => {
    expect(hasSameDays([1, 3, 5], [5, 1, 3])).toBe(true);
    expect(hasSameDays([1, 3], [1, 3, 5])).toBe(false);
  });
});

describe("buildNextScheduleHistory", () => {
  it("이력이 없으면 시작일 한 건짜리 이력으로 보고 덧붙인다", () => {
    const next = buildNextScheduleHistory({
      routine: makeRoutine(),
      effectiveFrom: "2026-08-09",
      days: [5],
      shouldAppend: true,
    });
    expect(next).toEqual([
      { effectiveFrom: "2026-01-01", days: [1] },
      { effectiveFrom: "2026-08-09", days: [5] },
    ]);
  });

  it("새 적용일 이후의 기존 이력을 잘라내, 미래 항목이 새 변경을 되돌리지 않는다", () => {
    const next = buildNextScheduleHistory({
      routine: makeRoutine({
        scheduleHistory: [
          { effectiveFrom: "2026-01-01", days: [1] },
          { effectiveFrom: "2026-09-01", days: [3] },
        ],
      }),
      effectiveFrom: "2026-08-09",
      days: [5],
      shouldAppend: true,
    });
    expect(next).toEqual([
      { effectiveFrom: "2026-01-01", days: [1] },
      { effectiveFrom: "2026-08-09", days: [5] },
    ]);
  });

  it("같은 적용일이 이미 있으면 새 요일로 대체한다", () => {
    const next = buildNextScheduleHistory({
      routine: makeRoutine({
        scheduleHistory: [
          { effectiveFrom: "2026-01-01", days: [1] },
          { effectiveFrom: "2026-08-09", days: [3] },
        ],
      }),
      effectiveFrom: "2026-08-09",
      days: [5],
      shouldAppend: true,
    });
    expect(next).toEqual([
      { effectiveFrom: "2026-01-01", days: [1] },
      { effectiveFrom: "2026-08-09", days: [5] },
    ]);
  });

  it("shouldAppend 가 아니면 기존 이력을 정렬만 해서 돌려준다", () => {
    const next = buildNextScheduleHistory({
      routine: makeRoutine({
        scheduleHistory: [
          { effectiveFrom: "2026-09-01", days: [3] },
          { effectiveFrom: "2026-01-01", days: [1] },
        ],
      }),
      effectiveFrom: "2026-08-09",
      days: [5],
      shouldAppend: false,
    });
    expect(next.map((item) => item.effectiveFrom)).toEqual([
      "2026-01-01",
      "2026-09-01",
    ]);
  });
});

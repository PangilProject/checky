import { describe, expect, it } from "vitest";
import { buildMonthKeysBetween } from "./monthKeys";

describe("buildMonthKeysBetween", () => {
  it("같은 달이면 그 달 하나다", () => {
    expect(buildMonthKeysBetween("2026-08-03", "2026-08-28")).toEqual([
      "2026-08",
    ]);
  });

  it("해를 넘는 범위는 12월 -> 1월로 롤오버한다", () => {
    expect(buildMonthKeysBetween("2026-11-15", "2027-02-01")).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
  });

  it("범위가 뒤집혀 있으면 빈 배열이다", () => {
    expect(buildMonthKeysBetween("2026-09-01", "2026-08-01")).toEqual([]);
  });

  it("한쪽이 비어 있으면 빈 배열이다", () => {
    expect(buildMonthKeysBetween("", "2026-08-01")).toEqual([]);
    expect(buildMonthKeysBetween("2026-08-01", "")).toEqual([]);
  });
});

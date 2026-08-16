import { describe, expect, it } from "vitest";
import {
  formatDateLikeToYmd,
  formatDateToYmd,
  getTodayYmd,
  parseYmd,
} from "./formatDate";

describe("formatDateToYmd", () => {
  it("로컬 게터 기준으로 YYYY-MM-DD 를 만든다", () => {
    expect(formatDateToYmd(new Date(2026, 2, 19))).toBe("2026-03-19");
  });

  it("한 자리 월·일을 0으로 채운다", () => {
    expect(formatDateToYmd(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("자정 직후에도 그날 날짜다 (UTC 시프트 없음)", () => {
    // KST 00:30 은 UTC 로는 전날 15:30 — toISOString 계열이면 하루 밀린다
    expect(formatDateToYmd(new Date(2026, 7, 9, 0, 30))).toBe("2026-08-09");
  });
});

describe("parseYmd", () => {
  it("로컬 자정 Date 로 파싱한다", () => {
    const date = parseYmd("2026-03-19");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(19);
    expect(date?.getHours()).toBe(0);
  });

  it("달력에 없는 날짜는 다음 달로 밀지 않고 null 이다", () => {
    expect(parseYmd("2026-02-30")).toBeNull();
    expect(parseYmd("2026-04-31")).toBeNull();
    expect(parseYmd("2026-13-01")).toBeNull();
    expect(parseYmd("2026-00-10")).toBeNull();
  });

  it("윤년 2월 29일만 유효하다", () => {
    expect(parseYmd("2024-02-29")).not.toBeNull();
    expect(parseYmd("2026-02-29")).toBeNull();
  });

  it("형식이 어긋나면 null 이다", () => {
    expect(parseYmd("abc")).toBeNull();
    expect(parseYmd("2026-3-19")).toBeNull();
    expect(parseYmd("")).toBeNull();
  });
});

describe("getTodayYmd", () => {
  it("오늘을 formatDateToYmd 와 같은 규칙으로 만든다", () => {
    expect(getTodayYmd()).toBe(formatDateToYmd(new Date()));
  });
});

describe("formatDateLikeToYmd", () => {
  it("Date 를 받는다", () => {
    expect(formatDateLikeToYmd(new Date(2026, 7, 5))).toBe("2026-08-05");
  });

  it("Timestamp 모양(toDate)을 받는다", () => {
    const timestampLike = { toDate: () => new Date(2026, 7, 5) };
    expect(formatDateLikeToYmd(timestampLike)).toBe("2026-08-05");
  });

  it("비었거나 모르는 모양이면 null 이다", () => {
    expect(formatDateLikeToYmd(undefined)).toBeNull();
    expect(formatDateLikeToYmd(null)).toBeNull();
    expect(formatDateLikeToYmd("2026-08-05")).toBeNull();
  });
});

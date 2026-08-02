import type { Timestamp } from "firebase/firestore/lite";

/**
 * Date -> YYYY-MM-DD
 *
 * @example
 * Date(2026-03-19) -> "2026-03-19"
 */
export const formatDateToYmd = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * "YYYY-MM-DD" -> Date (로컬 자정)
 *
 * new Date("YYYY-MM-DD")는 UTC로 해석되어 KST에서 하루 밀리므로 직접 파싱합니다.
 *
 * @example
 * "2026-03-19" -> Date(2026-03-19 00:00 KST)
 * "abc" -> null
 */
export const parseYmd = (value: string): Date | null => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!matched) return null;

  const [, year, month, day] = matched;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Timestamp -> ko-KR 날짜 문자열
 *
 * @example
 * undefined -> ""
 * Timestamp(2026-03-19) -> "2026. 03. 19."
 */
export const formatTimestampToKoreanDate = (
  timestamp?: Timestamp | null,
) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

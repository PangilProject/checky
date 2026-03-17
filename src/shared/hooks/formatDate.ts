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

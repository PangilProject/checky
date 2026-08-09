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
 * Date 또는 Firestore Timestamp -> YYYY-MM-DD
 *
 * 메타데이터(updatedAt 등)는 캐시 상태에 따라 Date 로도 Timestamp 로도
 * 흘러올 수 있어, 날짜 비교 전에 이 함수로 문자열로 눌러서 쓴다.
 *
 * @example
 * Date(2026-03-19) -> "2026-03-19"
 * Timestamp(2026-03-19) -> "2026-03-19"
 * undefined -> null
 */
export const formatDateLikeToYmd = (value: unknown): string | null => {
  if (!value) return null;
  if (value instanceof Date) return formatDateToYmd(value);

  const maybeTimestamp = value as { toDate?: () => Date };
  if (typeof maybeTimestamp.toDate === "function") {
    return formatDateToYmd(maybeTimestamp.toDate());
  }

  return null;
};

/**
 * "YYYY-MM-DD" -> "YYYY. MM. DD."
 *
 * @example
 * "2026-03-19" -> "2026. 03. 19."
 * "" -> ""
 */
export const formatYmdLabel = (value: string) => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!matched) return "";

  const [, year, month, day] = matched;
  return `${year}. ${month}. ${day}.`;
};

/**
 * "HH:MM"(24시간) -> "오전/오후 h:mm"
 *
 * @example
 * "15:30" -> "오후 3:30"
 * "" -> ""
 */
export const formatHmLabel = (value: string) => {
  const matched = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!matched) return "";

  const hour24 = Number(matched[1]);
  const minute = Number(matched[2]);
  if (hour24 > 23 || minute > 59) return "";

  const meridiem = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${meridiem} ${hour12}:${String(minute).padStart(2, "0")}`;
};

/**
 * Timestamp 또는 Date -> ko-KR 날짜 문자열
 *
 * mapDoc 을 거친 문서는 Date 로, 거치지 않은 원본은 Timestamp 로 올 수 있어
 * 둘 다 받는다.
 *
 * @example
 * undefined -> ""
 * Timestamp(2026-03-19) -> "2026. 03. 19."
 */
export const formatTimestampToKoreanDate = (
  value?: Timestamp | Date | null,
) => {
  if (!value) return "";
  const date = value instanceof Date ? value : value.toDate();
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

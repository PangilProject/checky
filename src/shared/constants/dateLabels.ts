import { SATURDAY_TEXT_CLASS, SUNDAY_TEXT_CLASS } from "./colors";

/**
 * 요일 표기를 한곳에서 관리한다.
 *
 * 순서가 곧 Date 의 getDay() 값(일요일 0 ~ 토요일 6)이므로,
 * 배열 순서를 바꾸면 요일 판단이 전부 어긋난다.
 */
export const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** getDay() 값을 요일 글자로 바꾼다. 범위 밖이면 빈 문자열이다. */
export const getDayLabel = (day: number) => WEEK_LABELS[day] ?? "";

/**
 * 요일 선택 UI 가 쓰는 { label, value } 목록.
 *
 * WEEK_LABELS 에서 뽑아 쓴다. 따로 적어 두면 한쪽만 고쳐 어긋난다.
 */
export const DAYS = WEEK_LABELS.map((label, value) => ({ label, value }));

/**
 * 주말 요일에 줄 글자색 클래스를 돌려준다. 평일은 undefined 다.
 *
 * 요일 글자가 아니라 getDay() 값으로 판단한다.
 * 글자로 비교하면 표기를 "일요일" 처럼 바꾸는 순간 색이 조용히 사라진다.
 */
export const getWeekendTextClass = (day: number) => {
  if (day === 0) return SUNDAY_TEXT_CLASS;
  if (day === 6) return SATURDAY_TEXT_CLASS;
  return undefined;
};

export const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export const getDayLabel = (day: number) => WEEK_LABELS[day] ?? "";

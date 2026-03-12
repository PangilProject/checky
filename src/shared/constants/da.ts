export const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export const getDayLabel = (day: number) => WEEK_LABELS[day] ?? "";

export const DAYS = [
  { label: "일", value: 0 },
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
  { label: "토", value: 6 },
];

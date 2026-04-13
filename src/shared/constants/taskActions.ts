export type TaskActionType =
  | "today"
  | "after"
  | "delete"
  | "copy"
  | "delete-all"
  | "rebuild-monthly-stats";

export const TASK_ACTION_LIST: {
  text: string;
  icon: TaskActionType;
}[] = [
  { text: "미완료 할 일을 오늘 하기", icon: "today" },
  { text: "미완료 할 일을 다른 날 하기", icon: "after" },
  { text: "미완료 할 일 삭제", icon: "delete" },
  { text: "모든 할 일 복사", icon: "copy" },
  { text: "모든 할 일 삭제", icon: "delete-all" },
  { text: "해당 월 남은 할 일 수 재계산", icon: "rebuild-monthly-stats" },
];

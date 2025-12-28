// mocks/tasks.ts
export interface Task {
  id: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
}

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "방 청소하기",
    categoryId: "9ROnaA7LTr1nOdgJLjMt",
    categoryColor: "#FF8D28",
    date: "2026-01-06",
  },
  {
    id: "t2",
    title: "relog 코드리뷰",
    categoryId: "blGTFMCDM6RP3H6A8IFp",
    categoryColor: "#35C759",
    date: "2026-01-06",
  },
  {
    id: "t3",
    title: "타입스크립트 공부하기",
    categoryId: "blGTFMCDM6RP3H6A8IFp",
    categoryColor: "#35C759",
    date: "2026-01-06",
  },
  {
    id: "t4",
    title: "500일 데이트",
    categoryId: "jPLRWeS1Empzr364f7YP",
    categoryColor: "#FFCC02",
    date: "2026-01-07", // ❗ 다른 날짜
  },
];

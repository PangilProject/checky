import { describe, expect, it } from "vitest";
import type { Category } from "@/shared/api/category";
import type { Task } from "@/shared/api/task";
import { summarizeRecord } from "./summarizeRecord";

const category = (id: string, name: string, orderIndex: number): Category =>
  ({ id, name, color: "#6155F5", status: "ACTIVE", orderIndex }) as Category;

const task = (id: string, date: string, categoryId: string): Task => ({
  id,
  title: id,
  categoryId,
  categoryColor: "#6155F5",
  date,
  orderIndex: 0,
});

const base = {
  categories: [category("study", "공부", 0), category("life", "생활", 1)],
  routines: [],
  routineLogs: [],
  startDate: "2026-09-20",
  endDate: "2026-09-26",
  cutoffDate: "2026-09-24",
};

describe("summarizeRecord", () => {
  it("기준일까지의 할 일만 세고, 지금 놓인 날짜의 기록만 완료로 친다", () => {
    const summary = summarizeRecord({
      ...base,
      tasks: [
        task("a", "2026-09-20", "study"),
        task("b", "2026-09-22", "study"),
        task("c", "2026-09-23", "life"),
        task("d", "2026-09-25", "life"), // 기준일 뒤
      ],
      taskLogs: [
        { id: "1", taskId: "a", date: "2026-09-20", completed: true },
        { id: "2", taskId: "b", date: "2026-09-21", completed: true }, // 옛 날짜의 기록
        { id: "3", taskId: "c", date: "2026-09-23", completed: true },
      ],
    });

    expect(summary.tasks.total).toBe(3);
    expect(summary.tasks.done).toBe(2);
    expect(summary.tasks.remaining.map((item) => item.id)).toEqual(["b"]);
  });

  it("해낸 할 일을 많이 해낸 분류부터, 같으면 분류 순서대로 센다", () => {
    const summary = summarizeRecord({
      ...base,
      tasks: [
        task("a", "2026-09-20", "life"),
        task("b", "2026-09-21", "study"),
        task("c", "2026-09-22", "gone"),
        task("d", "2026-09-22", "gone"),
      ],
      taskLogs: ["a", "b", "c", "d"].map((id, index) => ({
        id: String(index),
        taskId: id,
        date: id === "a" ? "2026-09-20" : id === "b" ? "2026-09-21" : "2026-09-22",
        completed: true,
      })),
    });

    expect(summary.byCategory.map((item) => [item.name, item.done])).toEqual([
      ["분류 없음", 2],
      ["공부", 1],
      ["생활", 1],
    ]);
  });

  it("해야 했던 날이 있는 루틴만 담고 합계를 낸다", () => {
    const summary = summarizeRecord({
      ...base,
      tasks: [],
      taskLogs: [],
      routines: [
        {
          id: "r1",
          title: "운동",
          categoryId: "life",
          days: [1, 3], // 월 21, 수 23
          orderIndex: 0,
          startDate: "2026-09-01",
          scheduleHistory: [{ effectiveFrom: "2026-09-01", days: [1, 3] }],
        },
        {
          id: "r2",
          title: "나중에 시작",
          categoryId: "life",
          days: [1],
          orderIndex: 1,
          startDate: "2026-10-01",
          scheduleHistory: [{ effectiveFrom: "2026-10-01", days: [1] }],
        },
      ],
      routineLogs: [{ id: "x", routineId: "r1", date: "2026-09-21", done: true }],
    });

    expect(summary.routineRows.map((row) => [row.routine.id, row.done, row.total])).toEqual([
      ["r1", 1, 2],
    ]);
    expect(summary.routines).toEqual({ total: 2, done: 1 });
  });
});

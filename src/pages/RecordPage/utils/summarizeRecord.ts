import type { Category } from "@/shared/api/category";
import type { Task } from "@/shared/api/task";
import type { TaskLog } from "@/shared/api/taskLog";
import type { MonthlyRoutineLog } from "@/shared/api/monthlyStats";
import {
  buildRoutineDays,
  summarizeRoutineDays,
  type Routine,
  type RoutineCount,
} from "@/shared/api/routine";

export interface RecordCategoryCount {
  categoryId: string;
  name: string;
  /** 저장된 hex. 칠할 때는 getCategoryColor 로 바꾼다 */
  color: string;
  done: number;
}

export interface RecordRoutineRow extends RoutineCount {
  routine: Routine;
  category?: Category;
}

export interface RecordSummary {
  tasks: RoutineCount & {
    /** 기준일까지 남은 할 일. 날짜 순이다 */
    remaining: Task[];
  };
  /** 해낸 할 일을 분류별로. 많이 해낸 분류부터 담고, 0개인 분류는 뺀다 */
  byCategory: RecordCategoryCount[];
  routines: RoutineCount;
  /** 기간에 해야 했던 날이 하루라도 있는 루틴만, 분류 순서와 루틴 순서대로 담는다 */
  routineRows: RecordRoutineRow[];
}

const UNKNOWN_CATEGORY = { name: "분류 없음", color: "" };

/**
 * 기록 화면의 숫자를 모두 센다.
 *
 * 세는 규칙은 달력과 같다. 그날 해야 했던 것이 전체, 그중 체크한 것이 완료다.
 * 할 일은 그 할 일이 지금 놓인 날짜의 기록만 완료로 친다(옮기면 기록도 따라간다).
 * 루틴은 buildRoutineDays 가 반복 요일 이력과 레거시 규칙을 달력과 같게 적용한다.
 * cutoffDate(보통 오늘) 뒤는 아직 오지 않은 날이라 세지 않는다.
 */
export const summarizeRecord = ({
  tasks,
  taskLogs,
  routines,
  routineLogs,
  categories,
  startDate,
  endDate,
  cutoffDate,
}: {
  tasks: Task[];
  taskLogs: TaskLog[];
  routines: Routine[];
  routineLogs: MonthlyRoutineLog[];
  categories: Category[];
  startDate: string;
  endDate: string;
  cutoffDate: string;
}): RecordSummary => {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const categoryOrder = new Map(categories.map((category, index) => [category.id, index]));
  const lastCounted = cutoffDate < endDate ? cutoffDate : endDate;

  const completedKeys = new Set(
    taskLogs.filter((log) => log.completed).map((log) => `${log.taskId}_${log.date}`),
  );
  const countedTasks = tasks.filter(
    (task) => task.date >= startDate && task.date <= lastCounted,
  );
  const isDone = (task: Task) => completedKeys.has(`${task.id}_${task.date}`);
  const doneTasks = countedTasks.filter(isDone);
  const remaining = countedTasks
    .filter((task) => !isDone(task))
    .sort((a, b) => a.date.localeCompare(b.date) || a.orderIndex - b.orderIndex);

  const doneByCategory = new Map<string, RecordCategoryCount>();
  doneTasks.forEach((task) => {
    const current = doneByCategory.get(task.categoryId);
    if (current) {
      current.done += 1;
      return;
    }
    const category = categoryById.get(task.categoryId);
    doneByCategory.set(task.categoryId, {
      categoryId: task.categoryId,
      name: category?.name ?? UNKNOWN_CATEGORY.name,
      color: category?.color ?? task.categoryColor ?? UNKNOWN_CATEGORY.color,
      done: 1,
    });
  });
  const byCategory = [...doneByCategory.values()].sort(
    (a, b) =>
      b.done - a.done ||
      (categoryOrder.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER) -
        (categoryOrder.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER),
  );

  const routineRows = routines
    .map((routine) => {
      const days = buildRoutineDays({
        routine,
        logs: routineLogs,
        startDate,
        endDate,
        cutoffDate,
      });
      const { total, done } = summarizeRoutineDays({ routine, days });
      return { routine, category: categoryById.get(routine.categoryId), total, done };
    })
    .filter((row) => row.total > 0)
    .sort(
      (a, b) =>
        (categoryOrder.get(a.routine.categoryId) ?? Number.MAX_SAFE_INTEGER) -
          (categoryOrder.get(b.routine.categoryId) ?? Number.MAX_SAFE_INTEGER) ||
        (a.routine.orderIndex ?? 0) - (b.routine.orderIndex ?? 0),
    );

  return {
    tasks: { total: countedTasks.length, done: doneTasks.length, remaining },
    byCategory,
    routines: {
      total: routineRows.reduce((sum, row) => sum + row.total, 0),
      done: routineRows.reduce((sum, row) => sum + row.done, 0),
    },
    routineRows,
  };
};

import type { RoutineScheduleHistoryItem } from "@/shared/api/routine";
import { getRoutinesByMonthOnce, getRoutineLogsByMonthOnce } from "@/shared/api/routine/queries";
import { getTasksByMonthOnce } from "@/shared/api/task/queries";
import { getTaskLogsByMonthOnce } from "@/shared/api/taskLog/queries";
import { replaceMonthlyStatsByMonth } from "./queries";
import type { MonthlyActivitySummary } from "./types";

type MonthlyTask = { id: string; date: string };
type MonthlyTaskLog = { taskId: string; date: string; completed: boolean };
type MonthlyRoutine = {
  id: string;
  startDate: string;
  endDate?: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
};
type MonthlyRoutineLog = { routineId: string; date: string; done: boolean };

const buildMonthlyActivityCountMap = ({
  date,
  tasks,
  taskLogs,
  routines,
  routineLogs,
}: {
  date: Date;
  tasks: MonthlyTask[];
  taskLogs: MonthlyTaskLog[];
  routines: MonthlyRoutine[];
  routineLogs: MonthlyRoutineLog[];
}) => {
  const next = new Map<string, { total: number; completed: number; remaining: number }>();
  const validTaskKeySet = new Set<string>();
  const validRoutineKeySet = new Set<string>();

  const ensure = (dateKey: string) => {
    if (!next.has(dateKey)) {
      next.set(dateKey, { total: 0, completed: 0, remaining: 0 });
    }
    return next.get(dateKey)!;
  };

  const getRepeatDaysByDate = ({
    history,
    date,
  }: {
    history: RoutineScheduleHistoryItem[];
    date: string;
  }) => {
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i];
      if (item.effectiveFrom <= date) return item.days;
    }
    return [];
  };

  tasks.forEach(({ id, date: dateKey }) => {
    ensure(dateKey).total += 1;
    validTaskKeySet.add(`${id}_${dateKey}`);
  });

  routines.forEach((routine) => {
    const { id, startDate, endDate } = routine;
    const history =
      routine.scheduleHistory && routine.scheduleHistory.length > 0
        ? [...routine.scheduleHistory].sort((a, b) =>
            a.effectiveFrom.localeCompare(b.effectiveFrom)
          )
        : [{ effectiveFrom: startDate, days: routine.days }];

    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;

      const isAfterStart = dateStr >= startDate;
      const isBeforeEnd = !endDate || dateStr <= endDate;
      if (!isAfterStart || !isBeforeEnd) continue;

      const repeatDays = getRepeatDaysByDate({ history, date: dateStr });
      if (repeatDays.includes(dateObj.getDay())) {
        ensure(dateStr).total += 1;
        validRoutineKeySet.add(`${id}_${dateStr}`);
      }
    }
  });

  taskLogs.forEach(({ taskId, date: dateKey, completed }) => {
    if (!completed) return;
    if (!next.has(dateKey)) return;
    if (!validTaskKeySet.has(`${taskId}_${dateKey}`)) return;
    ensure(dateKey).completed += 1;
  });

  routineLogs.forEach(({ routineId, date: dateKey, done }) => {
    if (!done) return;
    if (!next.has(dateKey)) return;
    if (!validRoutineKeySet.has(`${routineId}_${dateKey}`)) return;
    ensure(dateKey).completed += 1;
  });

  next.forEach((value) => {
    value.remaining = Math.max(value.total - value.completed, 0);
  });

  return next;
};

const convertToMonthlyStatsDays = ({
  monthKey,
  map,
}: {
  monthKey: string;
  map: Map<string, { total: number; completed: number; remaining: number }>;
}) => {
  const days: Record<string, MonthlyActivitySummary> = {};

  map.forEach((value, dateKey) => {
    if (!dateKey.startsWith(`${monthKey}-`)) return;
    const day = dateKey.slice(8, 10);
    days[day] = {
      total: value.total,
      completed: value.completed,
      remaining: value.remaining,
      hasActivity: value.total > 0,
    };
  });
  return days;
};

export const rebuildMonthlyStatsByMonth = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}) => {
  const [tasks, taskLogs, routines, routineLogs] = await Promise.all([
    getTasksByMonthOnce({ userId, month }),
    getTaskLogsByMonthOnce({ userId, month }),
    getRoutinesByMonthOnce({ userId, month }),
    getRoutineLogsByMonthOnce({ userId, month }),
  ]);

  const [year, monthIndex] = month.split("-").map(Number);
  const map = buildMonthlyActivityCountMap({
    date: new Date(year, monthIndex - 1, 1),
    tasks,
    taskLogs,
    routines,
    routineLogs,
  });
  const days = convertToMonthlyStatsDays({ monthKey: month, map });
  await replaceMonthlyStatsByMonth({ userId, month, days });
};

export const buildMonthKeysBetween = (startDate: string, endDate: string) => {
  if (!startDate || !endDate || startDate > endDate) return [] as string[];

  const [startYear, startMonth] = startDate.slice(0, 7).split("-").map(Number);
  const [endYear, endMonth] = endDate.slice(0, 7).split("-").map(Number);
  const result: string[] = [];

  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    result.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      y += 1;
      m = 1;
    }
  }

  return result;
};

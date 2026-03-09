export const getMonthInfo = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    year,
    month, // 0-based
    daysInMonth: lastDay.getDate(),
    startDay: firstDay.getDay(), // 0(일) ~ 6(토)
  };
};

export const useCalendar = (selectedDate: Date) => {
  const { year, month, daysInMonth, startDay } = getMonthInfo(selectedDate);

  const cells: (number | null)[] = [];

  // 앞쪽 빈 칸
  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }

  // 날짜 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return {
    year,
    month,
    cells, // 렌더링용
  };
};

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RoutineScheduleHistoryItem } from "@/shared/api/routine";

export const useMonthlyActivityMap = ({
  tasks,
  taskLogs,
}: {
  tasks: { date: string }[];
  taskLogs: { date: string; completed: boolean }[];
}) => {
  const map = useMemo(() => {
    const next = new Map<string, boolean>();

    tasks.forEach((task) => {
      next.set(task.date, true);
    });

    taskLogs.forEach((log) => {
      if (log.completed) {
        next.set(log.date, true);
      }
    });

    return next;
  }, [tasks, taskLogs]);

  return map;
};

import { useAuth } from "@/shared/hooks/useAuth";
import { getTasksByMonthOnce } from "../api/task";
import { getTaskLogsByMonthOnce } from "../api/taskLog";
import {
  getRoutineLogsByMonthOnce,
  getRoutinesByMonthOnce,
} from "../api/routine";
import {
  routineKeys,
  routineLogKeys,
  taskKeys,
  taskLogKeys,
} from "@/shared/query/keys";

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

export const useMonthlyData = (date: Date) => {
  const { user } = useAuth();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const monthKey = `${year}-${month}`;
  const userId = user?.uid ?? "";

  const tasksQuery = useQuery<MonthlyTask[]>({
    queryKey: taskKeys.byMonth(userId, monthKey),
    queryFn: () => getTasksByMonthOnce({ userId, month: monthKey }),
    enabled: Boolean(user?.uid),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const taskLogsQuery = useQuery<MonthlyTaskLog[]>({
    queryKey: taskLogKeys.byMonth(userId, monthKey),
    queryFn: () => getTaskLogsByMonthOnce({ userId, month: monthKey }),
    enabled: Boolean(user?.uid),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const routinesQuery = useQuery<MonthlyRoutine[]>({
    queryKey: routineKeys.byMonth(userId, monthKey),
    queryFn: () => getRoutinesByMonthOnce({ userId, month: monthKey }),
    enabled: Boolean(user?.uid),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const routineLogsQuery = useQuery<MonthlyRoutineLog[]>({
    queryKey: routineLogKeys.byMonth(userId, monthKey),
    queryFn: () => getRoutineLogsByMonthOnce({ userId, month: monthKey }),
    enabled: Boolean(user?.uid),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  return {
    tasks: tasksQuery.data ?? [],
    taskLogs: taskLogsQuery.data ?? [],
    routines: routinesQuery.data ?? [],
    routineLogs: routineLogsQuery.data ?? [],
    isLoading:
      tasksQuery.isLoading ||
      taskLogsQuery.isLoading ||
      routinesQuery.isLoading ||
      routineLogsQuery.isLoading,
    refresh: async () => {
      await Promise.all([
        tasksQuery.refetch(),
        taskLogsQuery.refetch(),
        routinesQuery.refetch(),
        routineLogsQuery.refetch(),
      ]);
    },
  };
};

//
export interface MonthlyActivityCount {
  total: number;
  completed: number;
  remaining: number;
}
export const useMonthlyActivityCountMap = ({
  date, // ⭐ 추가
  tasks,
  taskLogs,
  routines,
  routineLogs,
}: {
  date: Date;
  tasks: MonthlyTask[];
  taskLogs: MonthlyTaskLog[];
  routines: MonthlyRoutine[];
  routineLogs: { routineId: string; date: string; done: boolean }[];
}) => {
  const map = useMemo(() => {
    const next = new Map<string, MonthlyActivityCount>();
    const validTaskKeySet = new Set<string>();
    const validRoutineKeySet = new Set<string>();

    const ensure = (date: string) => {
      if (!next.has(date)) {
        next.set(date, { total: 0, completed: 0, remaining: 0 });
      }
      return next.get(date)!;
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
        if (item.effectiveFrom <= date) {
          return item.days;
        }
      }

      return [];
    };

    // 1️⃣ Task 전체 개수
    tasks.forEach(({ id, date }) => {
      ensure(date).total += 1;
      validTaskKeySet.add(`${id}_${date}`);
    });

    // 2️⃣ Routine 전체 개수
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
    // 3️⃣ Task 완료
    taskLogs.forEach(({ taskId, date, completed }) => {
      if (!completed) return;
      if (!next.has(date)) return;
      if (!validTaskKeySet.has(`${taskId}_${date}`)) return;
      ensure(date).completed += 1;
    });

    // 4️⃣ Routine 완료
    routineLogs.forEach(({ routineId, date, done }) => {
      if (!done) return;
      if (!next.has(date)) return;
      if (!validRoutineKeySet.has(`${routineId}_${date}`)) return;
      ensure(date).completed += 1;
    });

    // 5️⃣ remaining 계산
    next.forEach((value) => {
      value.remaining = Math.max(value.total - value.completed, 0);
    });

    return next;
  }, [date, tasks, taskLogs, routines, routineLogs]);

  return map;
};

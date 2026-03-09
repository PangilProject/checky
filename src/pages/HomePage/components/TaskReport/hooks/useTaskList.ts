import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategoriesOnce, type Category } from "@/shared/api/category";
import {
  createTask,
  getTasksByDateOnce,
  updateTaskOrder,
  type Task,
} from "@/shared/api/task";
import {
  getTaskLogsByDateOnce,
  toggleTaskLog,
  type TaskLog,
} from "@/shared/api/taskLog";
import {
  patchMonthlyStatsCompletionByDay,
  patchMonthlyStatsByDayDeltas,
  type MonthlyStats,
} from "@/shared/api/monthlyStats";
import {
  categoryKeys,
  monthlyStatsKeys,
  taskKeys,
  taskLogKeys,
} from "@/shared/api/keys";
import { baselineCacheCheck } from "@/shared/utils/perfBaseline";

const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_TASKS: Task[] = [];
const EMPTY_TASK_LOGS: TaskLog[] = [];

export const useTaskList = ({
  userId,
  dateString,
}: {
  userId: string | undefined;
  dateString: string;
}) => {
  const queryClient = useQueryClient();
  const tempIdRef = useRef(0);
  const lastTaskCacheLogRef = useRef<{ date: string; status?: string }>({
    date: "",
    status: undefined,
  });
  const lastTaskLogCacheLogRef = useRef<{ date: string; status?: string }>({
    date: "",
    status: undefined,
  });
  const safeUserId = userId ?? "";
  const taskQueryKey = useMemo(
    () => taskKeys.byDate(safeUserId, dateString),
    [safeUserId, dateString],
  );
  const taskLogQueryKey = useMemo(
    () => taskLogKeys.byDate(safeUserId, dateString),
    [safeUserId, dateString],
  );
  const categoryQueryKey = useMemo(
    () => categoryKeys.list(safeUserId, "ACTIVE"),
    [safeUserId],
  );

  const categoriesQuery = useQuery({
    queryKey: categoryQueryKey,
    queryFn: () => getCategoriesOnce({ userId: safeUserId, status: "ACTIVE" }),
    enabled: Boolean(userId),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const tasksQuery = useQuery({
    queryKey: taskQueryKey,
    queryFn: () => getTasksByDateOnce({ userId: safeUserId, date: dateString }),
    enabled: Boolean(userId && dateString),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const taskLogsQuery = useQuery({
    queryKey: taskLogQueryKey,
    queryFn: () =>
      getTaskLogsByDateOnce({ userId: safeUserId, date: dateString }),
    enabled: Boolean(userId && dateString),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;
  const tasks = tasksQuery.data ?? EMPTY_TASKS;
  const taskLogs = taskLogsQuery.data ?? EMPTY_TASK_LOGS;

  const taskState = queryClient.getQueryState(taskQueryKey);
  const logState = queryClient.getQueryState(taskLogQueryKey);

  useEffect(() => {
    if (!userId || !dateString) return;
    const last = lastTaskCacheLogRef.current;
    const status = taskState?.status;
    const shouldLog =
      status === "success" &&
      (last.date !== dateString || last.status !== status);
    if (!shouldLog) return;

    lastTaskCacheLogRef.current = { date: dateString, status };
    baselineCacheCheck("tasks/byDate", {
      date: dateString,
      status,
      updatedAt: taskState?.dataUpdatedAt,
    });
  }, [dateString, taskState?.dataUpdatedAt, taskState?.status, userId]);

  useEffect(() => {
    if (!userId || !dateString) return;
    const last = lastTaskLogCacheLogRef.current;
    const status = logState?.status;
    const shouldLog =
      status === "success" &&
      (last.date !== dateString || last.status !== status);
    if (!shouldLog) return;

    lastTaskLogCacheLogRef.current = { date: dateString, status };
    baselineCacheCheck("taskLogs/byDate", {
      date: dateString,
      status,
      updatedAt: logState?.dataUpdatedAt,
    });
  }, [dateString, logState?.dataUpdatedAt, logState?.status, userId]);

  const taskLogMap = useMemo(
    () => new Map(taskLogs.map((log) => [log.taskId, log])),
    [taskLogs]
  );

  const addTask = async ({
    title,
    categoryId,
    categoryColor,
  }: {
    title: string;
    categoryId: string;
    categoryColor: string;
  }) => {
    if (!title.trim() || !userId) return;

    const currentTasks = tasks.filter(
      (task) => task.categoryId === categoryId && task.date === dateString
    );

    tempIdRef.current += 1;
    const tempId = `temp-${tempIdRef.current}`;

    const optimisticTask: Task = {
      id: tempId,
      title,
      categoryId,
      categoryColor,
      date: dateString,
      orderIndex: currentTasks.length,
    };
    const monthKey = dateString.slice(0, 7);
    const dayKey = dateString.slice(8, 10);

    queryClient.setQueryData<Task[]>(taskQueryKey, (prev = []) => [
      ...prev,
      optimisticTask,
    ]);
    queryClient.setQueryData<MonthlyStats | null>(
      monthlyStatsKeys.byMonth(userId, monthKey),
      (prev) => {
        if (!prev) return prev;

        const currentDay = prev.days?.[dayKey];
        const total = Math.max((currentDay?.total ?? 0) + 1, 0);
        const completed = Math.max(currentDay?.completed ?? 0, 0);
        const remaining = Math.max((currentDay?.remaining ?? 0) + 1, 0);

        return {
          ...prev,
          days: {
            ...prev.days,
            [dayKey]: {
              total,
              completed: Math.min(completed, total),
              remaining: Math.min(remaining, total),
              hasActivity: total > 0,
            },
          },
        };
      }
    );

    try {
      const savedTask = await createTask({
        userId,
        title,
        categoryId,
        categoryColor,
        date: dateString,
      });

      queryClient.setQueryData<Task[]>(taskQueryKey, (prev = []) =>
        prev.map((task) => (task.id === tempId ? savedTask : task))
      );
      await patchMonthlyStatsByDayDeltas({
        userId,
        month: monthKey,
        day: dayKey,
        totalDelta: 1,
        completedDelta: 0,
        remainingDelta: 1,
      });
    } catch (error) {
      queryClient.setQueryData<Task[]>(taskQueryKey, (prev = []) =>
        prev.filter((task) => task.id !== tempId)
      );
      queryClient.setQueryData<MonthlyStats | null>(
        monthlyStatsKeys.byMonth(userId, monthKey),
        (prev) => {
          if (!prev) return prev;

          const currentDay = prev.days?.[dayKey];
          if (!currentDay) return prev;

          const total = Math.max((currentDay.total ?? 0) - 1, 0);
          const completed = Math.min(
            Math.max(currentDay.completed ?? 0, 0),
            total
          );
          const remaining = Math.max(
            Math.min(currentDay.remaining ?? 0, total),
            0
          );

          return {
            ...prev,
            days: {
              ...prev.days,
              [dayKey]: {
                ...currentDay,
                total,
                completed,
                remaining,
                hasActivity: total > 0,
              },
            },
          };
        }
      );
      console.error("Failed to create task", error);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!userId) return;

    const currentLog = taskLogMap.get(taskId);
    const nextCompleted = currentLog ? !currentLog.completed : true;
    const monthKey = dateString.slice(0, 7);
    const dayKey = dateString.slice(8, 10);
    const completedDelta = nextCompleted ? 1 : -1;

    queryClient.setQueryData<TaskLog[]>(taskLogQueryKey, (prev = []) => {
      const index = prev.findIndex((log) => log.taskId === taskId);
      if (index === -1) {
        if (!nextCompleted) return prev;
        return [...prev, { id: `temp-${taskId}`, taskId, date: dateString, completed: true }];
      }

      const next = [...prev];
      next[index] = { ...next[index], completed: nextCompleted };
      return next;
    });

    queryClient.setQueryData<MonthlyStats | null>(
      monthlyStatsKeys.byMonth(userId, monthKey),
      (prev) => {
        if (!prev) return prev;
        const currentDay = prev.days?.[dayKey];
        if (!currentDay) return prev;

        const completed = Math.max(
          (currentDay.completed ?? 0) + completedDelta,
          0
        );
        const total = Math.max(currentDay.total ?? 0, 0);
        const remaining = Math.max(total - completed, 0);

        return {
          ...prev,
          days: {
            ...prev.days,
            [dayKey]: {
              ...currentDay,
              completed,
              remaining,
              hasActivity: total > 0,
            },
          },
        };
      }
    );

    await toggleTaskLog({
      userId,
      taskId,
      date: dateString,
      currentLog,
    });

    await patchMonthlyStatsCompletionByDay({
      userId,
      month: monthKey,
      day: dayKey,
      completedDelta,
    });
  };

  const refresh = async () => {
    const monthKey = dateString.slice(0, 7);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: categoryQueryKey }),
      queryClient.invalidateQueries({ queryKey: taskQueryKey }),
      queryClient.invalidateQueries({ queryKey: taskLogQueryKey }),
      queryClient.invalidateQueries({
        queryKey: monthlyStatsKeys.byMonth(userId ?? "", monthKey),
      }),
    ]);
  };

  const reorderTasks = ({
    categoryId,
    nextTasks,
  }: {
    categoryId: string;
    nextTasks: Task[];
  }) => {
    if (!userId) return;

    queryClient.setQueryData<Task[]>(taskQueryKey, (prev = []) => {
      const others = prev.filter(
        (task) => task.categoryId !== categoryId || task.date !== dateString
      );

      return [
        ...others,
        ...nextTasks.map((task, index) => ({
          ...task,
          orderIndex: index,
        })),
      ];
    });

    updateTaskOrder({
      userId,
      tasks: nextTasks.map((task, index) => ({
        id: task.id,
        orderIndex: index,
      })),
    });
  };

  return {
    categories,
    tasks,
    taskLogMap,
    isLoading: categoriesQuery.isLoading || tasksQuery.isLoading,
    addTask,
    toggleTask,
    reorderTasks,
    refresh,
  };
};

import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategoriesOnce } from "@/shared/api/category";
import {
  createTask,
  getTasksByDateOnce,
  updateTaskOrder,
  type Task,
} from "@/shared/api/task";
import {
  getTaskLogsByDate,
  getTaskLogsByDateOnce,
  toggleTaskLog,
} from "@/shared/api/taskLog";
import { categoryKeys, taskKeys, taskLogKeys } from "@/shared/query/keys";
import { baselineCacheCheck } from "@/shared/utils/perfBaseline";

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
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

  const tasksQuery = useQuery({
    queryKey: taskQueryKey,
    queryFn: () => getTasksByDateOnce({ userId: safeUserId, date: dateString }),
    enabled: Boolean(userId && dateString),
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

  const taskLogsQuery = useQuery({
    queryKey: taskLogQueryKey,
    queryFn: () =>
      getTaskLogsByDateOnce({ userId: safeUserId, date: dateString }),
    enabled: false,
    placeholderData: (previous) => previous,
  });

  const categories = categoriesQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const taskLogs = taskLogsQuery.data ?? [];

  useEffect(() => {
    if (!userId || !dateString) return;

    const unsubscribe = getTaskLogsByDate({
      userId,
      date: dateString,
      onChange: (logs) => {
        queryClient.setQueryData(taskLogQueryKey, logs);
      },
    });

    return () => unsubscribe();
  }, [dateString, queryClient, taskLogQueryKey, userId]);

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
  }, [dateString, taskState?.status, userId]);

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
  }, [dateString, logState?.status, userId]);

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

    queryClient.setQueryData<Task[]>(taskQueryKey, (prev = []) => [
      ...prev,
      optimisticTask,
    ]);

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
    } catch (error) {
      queryClient.setQueryData<Task[]>(taskQueryKey, (prev = []) =>
        prev.filter((task) => task.id !== tempId)
      );
      console.error("Failed to create task", error);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!userId) return;

    const currentLog = taskLogMap.get(taskId);

    await toggleTaskLog({
      userId,
      taskId,
      date: dateString,
      currentLog,
    });
    await queryClient.invalidateQueries({ queryKey: taskLogQueryKey });
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
  };
};

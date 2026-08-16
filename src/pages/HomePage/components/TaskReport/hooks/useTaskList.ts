import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { Category } from "@/shared/api/category";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
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
import { useCompletionToggle } from "@/shared/hooks/useCompletionToggle";
import { useDebouncedCommit } from "@/shared/hooks/useDebouncedCommit";

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
  const { schedule: scheduleOrderCommit } = useDebouncedCommit();
  const tempIdRef = useRef(0);
  const lastTaskCacheLogRef = useRef<{ date: string; status?: string }>({
    date: "",
    status: undefined,
  });
  const lastTaskLogCacheLogRef = useRef<{ date: string; status?: string }>({
    date: "",
    status: undefined,
  });
  const runCompletionToggle = useCompletionToggle({
    kind: "task",
    failMessage: "완료 상태를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
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
  // 종료한 분류도 함께 읽는다. 그 분류에 이미 들어 있던 할 일을 계속 보여줘야 하기 때문이다.
  // 종료는 "새로 만들 때 고를 수 없다"는 뜻이지 "숨긴다"는 뜻이 아니다.
  const categoryQueryKey = useMemo(
    () => categoryKeys.list(safeUserId),
    [safeUserId],
  );

  const categoriesQuery = useCategoriesQuery(safeUserId, {
    enabled: Boolean(userId),
  });

  const tasksQuery = useQuery({
    queryKey: taskQueryKey,
    queryFn: () => getTasksByDateOnce({ userId: safeUserId, date: dateString }),
    enabled: Boolean(userId && dateString),
    placeholderData: (previous) => previous,
  });

  // 캐시 정책은 전역 기본값을 따른다. 함께 렌더되는 tasks 와 같은
  // 신선도(10분)를 쓴다. 따로 두면 체크 표시와 목록이 어긋난 채 보인다.
  const taskLogsQuery = useQuery({
    queryKey: taskLogQueryKey,
    queryFn: () =>
      getTaskLogsByDateOnce({ userId: safeUserId, date: dateString }),
    enabled: Boolean(userId && dateString),
    placeholderData: (previous) => previous,
  });

  const allCategories = categoriesQuery.data ?? EMPTY_CATEGORIES;
  const tasks = tasksQuery.data ?? EMPTY_TASKS;
  const taskLogs = taskLogsQuery.data ?? EMPTY_TASK_LOGS;

  /** 새 할 일을 넣을 수 있는 분류. 종료한 것은 고를 수 없다. */
  const selectableCategories = useMemo(
    () => allCategories.filter((category) => category.status === "ACTIVE"),
    [allCategories],
  );

  /**
   * 화면에 줄을 그릴 분류.
   *
   * 사용 중인 분류에, 그날 할 일이 남아 있는 종료된 분류를 더한다.
   * 종료된 분류를 빼면 그 안의 할 일이 목록에서 통째로 사라져
   * 완료도 삭제도 못 하는데 달력 개수에는 계속 잡히는 상태가 된다.
   * 종료된 것은 사용 중인 것 뒤에 둔다.
   */
  const visibleCategories = useMemo(() => {
    const usedCategoryIds = new Set(tasks.map((task) => task.categoryId));
    const endedWithTasks = allCategories.filter(
      (category) =>
        category.status !== "ACTIVE" && usedCategoryIds.has(category.id),
    );

    return endedWithTasks.length === 0
      ? selectableCategories
      : [...selectableCategories, ...endedWithTasks];
  }, [allCategories, selectableCategories, tasks]);

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
      // 경과일 표시가 이 값을 쓴다. 비워 두면 방금 만든 할 일만 라벨이 없다가
      // 나중에 다시 읽어 왔을 때 뒤늦게 나타난다.
      createdAt: new Date(),
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
    } catch {
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
      toast.error("할 일 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  /**
   * 할 일 체크 토글.
   *
   * 연타 방지·집계 반영·실패 롤백은 useCompletionToggle 이 맡는다.
   * 여기서는 할 일만 쓰는 캐시(그날의 taskLogs)를 고치고 되돌리는 법만 정한다.
   */
  const toggleTask = async (taskId: string) => {
    if (!userId) return;

    const currentLog = taskLogMap.get(taskId);
    const nextCompleted = currentLog ? !currentLog.completed : true;

    await runCompletionToggle({
      userId,
      guardKey: taskId,
      date: dateString,
      completedDelta: nextCompleted ? 1 : -1,
      applyOptimistic: () => {
        const prevLogs = queryClient.getQueryData<TaskLog[]>(taskLogQueryKey);

        queryClient.setQueryData<TaskLog[]>(taskLogQueryKey, (prev = []) => {
          const index = prev.findIndex((log) => log.taskId === taskId);
          if (index === -1) {
            if (!nextCompleted) return prev;
            return [
              ...prev,
              {
                id: `temp-${taskId}`,
                taskId,
                date: dateString,
                completed: true,
              },
            ];
          }

          const next = [...prev];
          next[index] = { ...next[index], completed: nextCompleted };
          return next;
        });

        return () => queryClient.setQueryData(taskLogQueryKey, prevLogs);
      },
      commit: async () => {
        await toggleTaskLog({ userId, taskId, date: dateString, currentLog });
      },
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

    // 연속 드래그를 마지막 상태 한 번으로 합쳐 저장한다. 화면은 위에서 이미 반영됐다.
    // 정렬 저장 실패 시 조용히 어긋나지 않도록 알리고 서버 상태로 되돌린다.
    scheduleOrderCommit(`tasks:${categoryId}`, () =>
      updateTaskOrder({
        userId,
        tasks: nextTasks.map((task, index) => ({
          id: task.id,
          orderIndex: index,
        })),
      }).catch(() => {
        toast.error("순서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        void queryClient.invalidateQueries({ queryKey: taskQueryKey });
      }),
    );
  };

  return {
    categories: visibleCategories,
    selectableCategories,
    tasks,
    taskLogMap,
    isLoading: categoriesQuery.isLoading || tasksQuery.isLoading,
    addTask,
    toggleTask,
    reorderTasks,
    refresh,
  };
};

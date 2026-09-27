import { useMemo, useState } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getTasksByDateOnce,
  getTasksByRangeOnce,
  type Task,
} from "@/shared/api/task";
import {
  getTaskLogsByDateOnce,
  getTaskLogsByRangeOnce,
  type TaskLog,
} from "@/shared/api/taskLog";
import { taskKeys, taskLogKeys } from "@/shared/api/keys";
import { buildMonthKeysBetween } from "@/shared/api/monthlyStats/monthKeys";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
import { useMonthlyStatsByMonths } from "@/shared/hooks/calendar";
import { useTaskDateMove } from "./useTaskDateMove";

export interface TaskWeekDay {
  date: string;
  tasks: Task[];
  logMap: Map<string, TaskLog>;
  doneCount: number;
  /** 그날 해야 할 루틴 수. 집계 문서가 없거나 몫이 없는 옛 문서면 null 이다 */
  routineCount: number | null;
  isLoading: boolean;
}

/**
 * 한 주 보기의 데이터.
 *
 * 하루 보기(useTaskList)와 **같은 날짜별 캐시 키**를 쓴다. 그래서 하루 보기에서 추가·체크·삭제한
 * 결과가 그대로 보이고, 이미 본 날은 다시 읽지 않는다.
 *
 * 다만 날짜별로 읽으면 처음 여는 주에 쿼리가 14개(이레 × 할 일·기록)이고, 빈 날도 쿼리마다
 * 최소 1 read 가 붙는다. 그래서 비어 있는 날이 있으면 주 범위로 두 번만 읽고, 결과를 날짜별
 * 캐시에 나눠 심는다. 날짜별 쿼리는 그 뒤에 켜지므로 방금 심은 날은 다시 읽지 않는다 (비용 이슈 17).
 * 루틴 수는 달력과 같은 monthlyStats 문서에서 가져오므로 추가 조회가 거의 없다.
 */
export const useTaskWeek = ({
  userId,
  weekDates,
}: {
  userId: string | undefined;
  weekDates: string[];
}) => {
  const queryClient = useQueryClient();
  const safeUserId = userId ?? "";
  const { moveTaskToDate } = useTaskDateMove(userId);
  // 옮기는 중인 할 일. 서버 반영 전에 또 끌면 옛 날짜 기준으로 한 번 더 옮겨진다
  const [movingIds, setMovingIds] = useState<Set<string>>(() => new Set());

  const categoriesQuery = useCategoriesQuery(safeUserId, {
    enabled: Boolean(userId),
  });

  const weekStart = weekDates[0] ?? "";
  const weekEnd = weekDates[weekDates.length - 1] ?? "";

  // 이 주를 처음 그릴 때 날짜별 캐시가 빈 날이 있는가. 이레가 모두 있으면 범위로 읽을 필요가 없다.
  // 주가 바뀔 때만 다시 판단한다. 범위 결과를 심은 뒤에 다시 보면 늘 "다 있음"이 되기 때문이다.
  const needsRange = useMemo(
    () =>
      Boolean(userId) &&
      weekDates.some(
        (date) =>
          queryClient.getQueryData(taskKeys.byDate(safeUserId, date)) === undefined ||
          queryClient.getQueryData(taskLogKeys.byDate(safeUserId, date)) === undefined,
      ),
    [queryClient, safeUserId, userId, weekDates],
  );

  const rangeQuery = useQuery({
    queryKey: taskKeys.byRange(safeUserId, weekStart, weekEnd),
    queryFn: async () => {
      const [tasks, logs] = await Promise.all([
        getTasksByRangeOnce({ userId: safeUserId, startDate: weekStart, endDate: weekEnd }),
        getTaskLogsByRangeOnce({ userId: safeUserId, startDate: weekStart, endDate: weekEnd }),
      ]);
      // 이미 있는 캐시는 덮지 않는다. 체크나 추가가 낙관 반영된 값일 수 있다.
      weekDates.forEach((date) => {
        const tasksKey = taskKeys.byDate(safeUserId, date);
        const logsKey = taskLogKeys.byDate(safeUserId, date);
        if (queryClient.getQueryData(tasksKey) === undefined) {
          queryClient.setQueryData<Task[]>(
            tasksKey,
            tasks.filter((task) => task.date === date),
          );
        }
        if (queryClient.getQueryData(logsKey) === undefined) {
          queryClient.setQueryData<TaskLog[]>(
            logsKey,
            logs.filter((log) => log.date === date),
          );
        }
      });
      return { taskCount: tasks.length, logCount: logs.length };
    },
    enabled: needsRange && weekDates.length > 0,
  });

  // 범위 조회가 끝나거나 실패한 뒤에 날짜별 쿼리를 켠다. 실패하면 날짜별로 읽는다.
  const perDateEnabled =
    Boolean(userId) && (!needsRange || rangeQuery.isSuccess || rangeQuery.isError);

  const taskQueries = useQueries({
    queries: weekDates.map((date) => ({
      queryKey: taskKeys.byDate(safeUserId, date),
      queryFn: () => getTasksByDateOnce({ userId: safeUserId, date }),
      enabled: perDateEnabled,
    })),
  });
  const logQueries = useQueries({
    queries: weekDates.map((date) => ({
      queryKey: taskLogKeys.byDate(safeUserId, date),
      queryFn: () => getTaskLogsByDateOnce({ userId: safeUserId, date }),
      enabled: perDateEnabled,
    })),
  });

  const months = useMemo(
    () => buildMonthKeysBetween(weekDates[0] ?? "", weekDates[weekDates.length - 1] ?? ""),
    [weekDates],
  );
  const { statsByMonth } = useMonthlyStatsByMonths({ months });

  const categoryOrder = useMemo(() => {
    const order = new Map<string, number>();
    (categoriesQuery.data ?? []).forEach((category, index) =>
      order.set(category.id, index),
    );
    return order;
  }, [categoriesQuery.data]);

  const days: TaskWeekDay[] = weekDates.map((date, index) => {
    const tasks = [...(taskQueries[index]?.data ?? [])].sort(
      (a, b) =>
        (categoryOrder.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER) -
          (categoryOrder.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER) ||
        a.orderIndex - b.orderIndex,
    );
    const logMap = new Map(
      (logQueries[index]?.data ?? []).map((log) => [log.taskId, log]),
    );
    const monthStats = statsByMonth[date.slice(0, 7)];
    const stat = monthStats?.days?.[date.slice(8, 10)];

    return {
      date,
      tasks,
      logMap,
      doneCount: tasks.filter((task) => logMap.get(task.id)?.completed).length,
      // 문서는 있는데 그날 칸이 없으면 그날 할 것이 없었던 것이다
      routineCount: !monthStats ? null : stat ? (stat.routineTotal ?? null) : 0,
      isLoading:
        (needsRange && rangeQuery.isLoading) || Boolean(taskQueries[index]?.isLoading),
    };
  });

  /**
   * 끌어 놓은 날로 옮긴다.
   *
   * 화면은 먼저 옮겨 두고 서버에 반영한다. 반영에 성공하면 useTaskDateMove 가 두 날짜를
   * 다시 읽어 서버의 순서로 맞추고, 실패하면 두 날짜를 다시 읽어 원래 자리로 돌린다.
   */
  const moveTask = async (task: Task, nextDate: string) => {
    if (!userId || nextDate === task.date || movingIds.has(task.id)) return;

    const prevTasksKey = taskKeys.byDate(userId, task.date);
    const nextTasksKey = taskKeys.byDate(userId, nextDate);
    const prevLogsKey = taskLogKeys.byDate(userId, task.date);
    const nextLogsKey = taskLogKeys.byDate(userId, nextDate);
    const movedLog = queryClient
      .getQueryData<TaskLog[]>(prevLogsKey)
      ?.find((log) => log.taskId === task.id);

    setMovingIds((prev) => new Set(prev).add(task.id));
    queryClient.setQueryData<Task[]>(prevTasksKey, (prev = []) =>
      prev.filter((item) => item.id !== task.id),
    );
    queryClient.setQueryData<Task[]>(nextTasksKey, (prev) =>
      prev ? [...prev, { ...task, date: nextDate, orderIndex: prev.length }] : prev,
    );
    if (movedLog) {
      queryClient.setQueryData<TaskLog[]>(prevLogsKey, (prev = []) =>
        prev.filter((log) => log.taskId !== task.id),
      );
      queryClient.setQueryData<TaskLog[]>(nextLogsKey, (prev) =>
        prev ? [...prev, { ...movedLog, date: nextDate }] : prev,
      );
    }

    try {
      await moveTaskToDate(task, nextDate);
      // 옮긴 기록은 서버에서 새 문서 ID 로 다시 만들어지므로 두 날짜의 기록도 다시 읽는다
      await Promise.all(
        [prevLogsKey, nextLogsKey].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    } catch {
      toast.error("할 일 이동에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      await Promise.all(
        [prevTasksKey, nextTasksKey, prevLogsKey, nextLogsKey].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    } finally {
      setMovingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const refresh = () =>
    Promise.all(
      weekDates.flatMap((date) => [
        queryClient.invalidateQueries({ queryKey: taskKeys.byDate(safeUserId, date) }),
        queryClient.invalidateQueries({ queryKey: taskLogKeys.byDate(safeUserId, date) }),
      ]),
    );

  return { days, moveTask, movingIds, refresh };
};

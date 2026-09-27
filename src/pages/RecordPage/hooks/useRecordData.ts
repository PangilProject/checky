import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
import {
  routineKeys,
  routineLogKeys,
  taskKeys,
  taskLogKeys,
} from "@/shared/api/keys";
import { getTasksByRangeOnce } from "@/shared/api/task";
import { getTaskLogsByRangeOnce } from "@/shared/api/taskLog";
import { getRoutineLogsByRangeOnce } from "@/shared/api/routineLog";
import { getRoutinesOnce } from "@/shared/api/routine";
import { summarizeRecord } from "../utils/summarizeRecord";

/**
 * 기록 화면이 한 기간을 돌아보는 데 필요한 원본을 읽어 센다.
 *
 * 읽는 범위는 기간 시작 ~ 기준일(보통 오늘)까지다. 아직 오지 않은 날은 세지 않으므로 읽지 않는다.
 * 한 달을 처음 열면 그 기간의 할 일·할 일 기록·루틴 기록 수에 루틴 수를 더한 만큼 읽는다.
 *
 * 할 일은 홈의 여러 곳(추가·체크·이동·일괄 동작)에서 바뀌는데 그 경로들은 날짜별 캐시만 고친다.
 * 그래서 할 일 두 쿼리는 이 화면을 열 때마다 다시 읽는다(staleTime 0). 캐시는 남아 있어
 * 다시 읽는 동안에도 지난 값이 먼저 보인다.
 * 루틴 기록은 체크 토글이 이 캐시를 무효화하고, 루틴 목록은 루틴을 고치면 무효화되므로
 * 전역 기본 신선도를 따른다.
 */
export const useRecordData = ({
  startDate,
  endDate,
  cutoffDate,
}: {
  startDate: string;
  endDate: string;
  cutoffDate: string;
}) => {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const fetchEnd = cutoffDate < endDate ? cutoffDate : endDate;
  // 아직 시작하지 않은 기간은 셀 것이 없으므로 읽지 않는다
  const enabled = Boolean(userId) && startDate <= fetchEnd;

  const categoriesQuery = useCategoriesQuery(userId, { enabled: Boolean(userId) });

  const tasksQuery = useQuery({
    queryKey: taskKeys.byRange(userId, startDate, fetchEnd),
    queryFn: () => getTasksByRangeOnce({ userId, startDate, endDate: fetchEnd }),
    enabled,
    staleTime: 0,
  });
  const taskLogsQuery = useQuery({
    queryKey: taskLogKeys.byRange(userId, startDate, fetchEnd),
    queryFn: () => getTaskLogsByRangeOnce({ userId, startDate, endDate: fetchEnd }),
    enabled,
    staleTime: 0,
  });
  const routinesQuery = useQuery({
    queryKey: routineKeys.list(userId),
    queryFn: () => getRoutinesOnce(userId),
    enabled,
  });
  const routineLogsQuery = useQuery({
    queryKey: routineLogKeys.byRange(userId, startDate, fetchEnd),
    queryFn: () =>
      getRoutineLogsByRangeOnce({ userId, startDate, endDate: fetchEnd }),
    enabled,
  });

  const queries = [tasksQuery, taskLogsQuery, routinesQuery, routineLogsQuery];
  const isLoading =
    categoriesQuery.isLoading || queries.some((query) => query.isLoading);
  const isError =
    categoriesQuery.isError || queries.some((query) => query.isError);

  const summary = useMemo(
    () =>
      summarizeRecord({
        tasks: tasksQuery.data ?? [],
        taskLogs: taskLogsQuery.data ?? [],
        routines: routinesQuery.data ?? [],
        routineLogs: routineLogsQuery.data ?? [],
        categories: categoriesQuery.data ?? [],
        startDate,
        endDate,
        cutoffDate,
      }),
    [
      tasksQuery.data,
      taskLogsQuery.data,
      routinesQuery.data,
      routineLogsQuery.data,
      categoriesQuery.data,
      startDate,
      endDate,
      cutoffDate,
    ],
  );

  const refetch = () => {
    void categoriesQuery.refetch();
    queries.forEach((query) => void query.refetch());
  };

  return { summary, isLoading, isError, refetch };
};

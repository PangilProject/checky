import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteTaskWithLogs, updateTaskWithDateMove } from "@/shared/api/task";
import type { Task } from "@/shared/api/task";
import type { Category } from "@/shared/api/category";
import { monthlyStatsKeys, taskKeys } from "@/shared/api/keys";
import {
  collectAffectedMonths,
  patchMonthlyStatsByDayDeltas,
  refreshCalendarConsistency,
} from "@/shared/api/monthlyStats";
import { toast } from "react-toastify";

// 생성은 목록의 인라인 입력(useTaskList.addTask)이 전담한다.
// 모달은 기존 할 일의 조회·수정만 다룬다. 생성 경로를 두 갈래로 두면
// 한쪽만 월간 집계를 갱신하는 식으로 어긋나기 쉽다.
interface UseTaskModalHandlersParams {
  mode: "VIEW" | "EDIT";
  task?: Task;
  selectedDate: string;
  categoryId: string;
  categoryColor: string;
  categories: Category[];
  onClose: () => void;
  userId?: string;
}

export const useTaskModalHandlers = ({
  mode,
  task,
  selectedDate,
  categoryId,
  categoryColor,
  categories,
  onClose,
  userId,
}: UseTaskModalHandlersParams) => {
  const queryClient = useQueryClient();
  const DEFAULT_TIME = "12:00";
  const [taskInput, setTaskInput] = useState(task?.title ?? "");
  const [taskDate, setTaskDate] = useState(task?.date ?? selectedDate);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    task?.categoryId ?? categoryId
  );
  const [timeEnabled, setTimeEnabled] = useState<boolean>(Boolean(task?.time));
  const [taskTime, setTaskTime] = useState<string>(task?.time ?? DEFAULT_TIME);
  const [currentMode, setCurrentMode] = useState(mode);
  // 저장/삭제/이동 처리 중 중복 실행 방지
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = currentMode === "VIEW";
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );
  const effectiveCategoryId =
    selectedCategoryId ?? categories[0]?.id ?? "";
  const selectedCategoryColor =
    selectedCategory?.color ??
    categories.find((c) => c.id === effectiveCategoryId)?.color ??
    categoryColor;

  const invalidateTaskDates = (dates: string[]) => {
    if (!userId) return;
    const uniqueDates = Array.from(new Set(dates.filter(Boolean)));
    uniqueDates.forEach((date) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byDate(userId, date),
      });
      queryClient.invalidateQueries({
        queryKey: monthlyStatsKeys.byMonth(userId, date.slice(0, 7)),
      });
    });
  };

  /**
   * 할 일이 다른 날짜로 옮겨진 뒤 달력 집계를 맞춘다.
   *
   * 이동은 두 날짜의 전체·완료·남은 개수가 동시에 움직이고 완료 기록도 따라가므로,
   * 증감을 손으로 계산하지 않고 두 날짜가 걸친 달을 원본에서 다시 센다.
   * 옛 날짜와 새 날짜가 다른 달일 수 있어 둘 다 넘겨야 한다.
   *
   * 다시 세는 쪽이 먼저다. 캐시를 먼저 비우면 아직 낡은 문서를 다시 읽어 온다.
   *
   * 여기서 실패해도 할 일 자체는 이미 옮겨진 뒤다. 실패를 위로 던지면
   * 저장에 실패했다고 잘못 알리게 되므로, 달력만 어긋났다는 사실과
   * 되돌릴 방법을 따로 알린다.
   */
  const syncCalendarAfterDateMove = async (dates: string[]) => {
    if (!userId) return;

    const uniqueDates = Array.from(new Set(dates.filter(Boolean)));

    try {
      await refreshCalendarConsistency({
        queryClient,
        userId,
        affectedMonths: collectAffectedMonths({ dates: uniqueDates }),
        recalculate: true,
        // 할 일만 옮겨졌으므로 task 몫만 다시 세고, 루틴 몫은 기존 집계를 쓴다.
        recalculateScope: "task",
        invalidateTasksByMonth: true,
      });

      await Promise.all(
        uniqueDates.map((date) =>
          queryClient.invalidateQueries({
            queryKey: taskKeys.byDate(userId, date),
          }),
        ),
      );
    } catch {
      toast.error(
        "할 일은 옮겼지만 달력 숫자를 맞추지 못했습니다. 리스트 메뉴의 월간 통계 재생성을 실행해 주세요.",
      );
    }
  };

  const handleUpdateTask = async () => {
    if (!taskInput.trim()) {
      toast.error("할 일 내용을 입력해 주세요.");
      return;
    }
    if (!task || !userId || !effectiveCategoryId) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const isDateChanged = task.date !== taskDate;

      await updateTaskWithDateMove({
        userId,
        taskId: task.id,
        title: taskInput.trim(),
        ...(timeEnabled ? { time: taskTime } : { time: undefined }),
        prevDate: task.date,
        nextDate: taskDate,
        prevCategoryId: task.categoryId,
        categoryId: effectiveCategoryId,
        categoryColor: selectedCategoryColor,
      });

      // 날짜가 그대로면 날짜별 개수가 바뀌지 않으므로 비싼 재계산을 하지 않는다
      if (isDateChanged) {
        await syncCalendarAfterDateMove([task.date, taskDate]);
      } else {
        invalidateTaskDates([taskDate]);
      }
      onClose();
    } catch {
      toast.error("할 일 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !userId) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { wasCompleted } = await deleteTaskWithLogs({
        userId,
        taskId: task.id,
      });
      await patchMonthlyStatsByDayDeltas({
        userId,
        month: task.date.slice(0, 7),
        day: task.date.slice(8, 10),
        totalDelta: -1,
        completedDelta: wasCompleted ? -1 : 0,
        remainingDelta: wasCompleted ? 0 : -1,
      });
      invalidateTaskDates([task.date]);
      onClose();
    } catch {
      toast.error("할 일 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveTask = async (nextDate: string) => {
    if (!task || !userId || !nextDate || nextDate === task.date) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateTaskWithDateMove({
        userId,
        taskId: task.id,
        title: task.title,
        ...(task.time ? { time: task.time } : { time: undefined }),
        prevDate: task.date,
        nextDate,
        prevCategoryId: task.categoryId,
        categoryId: task.categoryId,
        categoryColor: task.categoryColor,
      });
      await syncCalendarAfterDateMove([task.date, nextDate]);
      onClose();
    } catch {
      toast.error("할 일 이동에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowTimeField = !isReadOnly || Boolean(task?.time);

  return {
    taskInput,
    setTaskInput,
    taskDate,
    setTaskDate,
    selectedCategoryId: effectiveCategoryId,
    setSelectedCategoryId,
    timeEnabled,
    setTimeEnabled,
    taskTime,
    setTaskTime,
    currentMode,
    setCurrentMode,
    isReadOnly,
    isSubmitting,
    shouldShowTimeField,
    defaultTime: DEFAULT_TIME,
    selectedCategoryColor,
    handleUpdateTask,
    handleDeleteTask,
    handleMoveTask,
  };
};

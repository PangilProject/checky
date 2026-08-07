import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTaskWithLogs, updateTaskWithDateMove } from "@/shared/api/task";
import type { Task } from "@/shared/api/task";
import type { Category } from "@/shared/api/category";
import { monthlyStatsKeys, taskKeys } from "@/shared/api/keys";
import { patchMonthlyStatsByDayDeltas } from "@/shared/api/monthlyStats";
import { toast } from "react-toastify";

interface UseTaskModalHandlersParams {
  mode: "CREATE" | "VIEW" | "EDIT";
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

  const handleCreateTask = async () => {
    if (!taskInput.trim()) {
      toast.error("할 일 내용을 입력해 주세요.");
      return;
    }
    if (!userId || !effectiveCategoryId) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask({
        userId,
        title: taskInput.trim(),
        categoryId: effectiveCategoryId,
        categoryColor: selectedCategoryColor,
        date: taskDate,
        ...(timeEnabled && { time: taskTime }),
      });
      invalidateTaskDates([taskDate]);
      onClose();
    } catch {
      toast.error("할 일 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
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

      invalidateTaskDates([task.date, taskDate]);
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
      invalidateTaskDates([task.date, nextDate]);
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
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleMoveTask,
  };
};

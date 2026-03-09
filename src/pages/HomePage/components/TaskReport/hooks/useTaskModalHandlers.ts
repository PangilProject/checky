import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTaskWithLogs, updateTaskWithDateMove } from "@/shared/api/task";
import type { Task } from "@/shared/api/task";
import type { Category } from "@/shared/api/category";
import { taskKeys } from "@/shared/api/keys";

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
    });
  };

  const handleCreateTask = async () => {
    if (!taskInput.trim() || !userId || !effectiveCategoryId) return;

    try {
      await createTask({
        userId,
        title: taskInput,
        categoryId: effectiveCategoryId,
        categoryColor: selectedCategoryColor,
        date: taskDate,
        ...(timeEnabled && { time: taskTime }),
      });
      invalidateTaskDates([taskDate]);
      onClose();
    } catch (e) {
      console.error("태스크 생성 실패", e);
    }
  };

  const handleUpdateTask = async () => {
    if (!task || !taskInput.trim() || !userId || !effectiveCategoryId) return;

    try {
      await updateTaskWithDateMove({
        userId,
        taskId: task.id,
        title: taskInput,
        ...(timeEnabled ? { time: taskTime } : { time: undefined }),
        prevDate: task.date,
        nextDate: taskDate,
        prevCategoryId: task.categoryId,
        categoryId: effectiveCategoryId,
        categoryColor: selectedCategoryColor,
      });

      invalidateTaskDates([task.date, taskDate]);
      onClose();
    } catch (e) {
      console.error("태스크 수정 실패", e);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !userId) return;

    try {
      await deleteTaskWithLogs({
        userId,
        taskId: task.id,
      });
      invalidateTaskDates([task.date]);
      onClose();
    } catch (e) {
      console.error("태스크 삭제 실패", e);
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
    shouldShowTimeField,
    defaultTime: DEFAULT_TIME,
    selectedCategoryColor,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  };
};

import { useEffect, useMemo, useState } from "react";
import { createTask, deleteTaskWithLogs, updateTaskWithDateMove } from "@/shared/api/task";
import type { Task } from "@/shared/api/task";
import type { Category } from "@/shared/api/category";

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
  const selectedCategoryColor = selectedCategory?.color ?? categoryColor;

  useEffect(() => {
    if (selectedCategoryId && selectedCategory) return;
    if (categories.length === 0) return;
    setSelectedCategoryId(categories[0].id);
  }, [categories, selectedCategory, selectedCategoryId]);

  const handleCreateTask = async () => {
    if (!taskInput.trim() || !userId || !selectedCategoryId) return;

    try {
      await createTask({
        userId,
        title: taskInput,
        categoryId: selectedCategoryId,
        categoryColor: selectedCategoryColor,
        date: taskDate,
        ...(timeEnabled && { time: taskTime }),
      });
      onClose();
    } catch (e) {
      console.error("태스크 생성 실패", e);
    }
  };

  const handleUpdateTask = async () => {
    if (!task || !taskInput.trim() || !userId || !selectedCategoryId) return;

    try {
      await updateTaskWithDateMove({
        userId,
        taskId: task.id,
        title: taskInput,
        ...(timeEnabled ? { time: taskTime } : { time: undefined }),
        prevDate: task.date,
        nextDate: taskDate,
        prevCategoryId: task.categoryId,
        categoryId: selectedCategoryId,
        categoryColor: selectedCategoryColor,
      });

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
    selectedCategoryId,
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

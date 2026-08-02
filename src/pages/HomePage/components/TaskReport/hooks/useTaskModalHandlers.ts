import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTaskWithLogs,
  updateTaskWithDateMove,
} from "@/shared/api/task";
import type { Task } from "@/shared/api/task";
import type { Category } from "@/shared/api/category";
import { monthlyStatsKeys, taskKeys } from "@/shared/api/keys";
import { patchMonthlyStatsByDayDeltas } from "@/shared/api/monthlyStats";
import { toast } from "react-toastify";
import { useSubmitLock } from "@/shared/hooks/useSubmitLock";

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
  const { isSubmitting, runExclusive } = useSubmitLock();
  const DEFAULT_TIME = "12:00";
  const [taskInput, setTaskInput] = useState(task?.title ?? "");
  const [taskDate, setTaskDate] = useState(task?.date ?? selectedDate);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    task?.categoryId ?? categoryId,
  );
  const [timeEnabled, setTimeEnabled] = useState<boolean>(Boolean(task?.time));
  const [taskTime, setTaskTime] = useState<string>(task?.time ?? DEFAULT_TIME);
  const [currentMode, setCurrentMode] = useState(mode);

  const isReadOnly = currentMode === "VIEW";
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );
  const effectiveCategoryId = selectedCategoryId ?? categories[0]?.id ?? "";
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

  /** 첫 번째 검증 실패 사유. 통과하면 null. */
  const getValidationMessage = () => {
    if (!taskInput.trim()) return "할 일을 입력해주세요.";
    if (!effectiveCategoryId) return "카테고리를 먼저 추가해주세요.";
    return null;
  };

  // 변경 사항이 없으면 저장 버튼을 비활성화하기 위한 판단값
  const isDirty = task
    ? taskInput.trim() !== task.title ||
      taskDate !== task.date ||
      effectiveCategoryId !== task.categoryId ||
      (timeEnabled ? taskTime : "") !== (task.time ?? "")
    : true;

  const handleCreateTask = async () => {
    const validationMessage = getValidationMessage();
    if (validationMessage) {
      toast.error(validationMessage, { toastId: "task-form-validation" });
      return;
    }
    if (!userId) return;

    await runExclusive(async () => {
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
        toast.error("할 일 저장에 실패했습니다.");
      }
    });
  };

  const handleUpdateTask = async () => {
    const validationMessage = getValidationMessage();
    if (validationMessage) {
      toast.error(validationMessage, { toastId: "task-form-validation" });
      return;
    }
    if (!task || !userId) return;

    await runExclusive(async () => {
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
        toast.error("할 일 수정에 실패했습니다.");
      }
    });
  };

  const handleDeleteTask = async () => {
    if (!task || !userId) return;

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
    } catch (e) {
      console.error("태스크 삭제 실패", e);
    }
  };

  const handleMoveTask = async (nextDate: string) => {
    if (!task || !userId || !nextDate || nextDate === task.date) return;

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
    } catch (e) {
      console.error("태스크 이동 실패", e);
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
    isDirty,
    isSubmitting,
    defaultTime: DEFAULT_TIME,
    selectedCategoryColor,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleMoveTask,
  };
};

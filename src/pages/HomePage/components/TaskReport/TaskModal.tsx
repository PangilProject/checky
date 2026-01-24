import { useEffect, useMemo, useState } from "react";
import { Space10, Space8 } from "@/shared/ui/Space";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  createTask,
  deleteTaskWithLogs,
  type Task,
  updateTaskWithDateMove,
} from "@/shared/api/task";
import { ModalWrapper } from "@/shared/ui/Modal";
import type { Category } from "@/shared/api/category";
import {
  CategoryField,
  DateField,
  ModalTitle,
  TaskInput,
  TimeField,
} from "./components/TaskModalFields";
import { ButtonSection } from "./components/TaskModalButtons";

interface TaskModalProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  task?: Task;
  selectedDate: string;
  categoryId: string;
  categoryColor: string;
  categories: Category[];
  onClose: () => void;
}

export default function TaskModal({
  mode,
  task,
  selectedDate,
  categoryId,
  categoryColor,
  categories,
  onClose,
}: TaskModalProps) {
  const { user } = useAuth();

  const [taskInput, setTaskInput] = useState(task?.title ?? "");
  const [taskDate, setTaskDate] = useState(task?.date ?? selectedDate);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    task?.categoryId ?? categoryId,
  );
  const DEFAULT_TIME = "12:00";

  const [timeEnabled, setTimeEnabled] = useState<boolean>(Boolean(task?.time));

  const [taskTime, setTaskTime] = useState<string>(task?.time ?? DEFAULT_TIME);
  const [currentMode, setCurrentMode] = useState(mode);

  const isReadOnly = currentMode === "VIEW";
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );
  const selectedCategoryColor = selectedCategory?.color ?? categoryColor;

  useEffect(() => {
    if (selectedCategoryId && selectedCategory) return;
    if (categories.length === 0) return;
    setSelectedCategoryId(categories[0].id);
  }, [categories, selectedCategory, selectedCategoryId]);

  /* ======================
     CREATE
  ====================== */
  const handleCreateTask = async () => {
    if (!taskInput.trim() || !user || !selectedCategoryId) return;

    try {
      await createTask({
        userId: user.uid,
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

  /* ======================
     UPDATE
  ====================== */
  const handleUpdateTask = async () => {
    if (!task || !taskInput.trim() || !user || !selectedCategoryId) return;

    try {
      await updateTaskWithDateMove({
        userId: user.uid,
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
  /* ======================
     DELETE
  ====================== */
  const handleDeleteTask = async () => {
    if (!task || !user) return;

    try {
      await deleteTaskWithLogs({
        userId: user.uid,
        taskId: task.id,
      });
      onClose();
    } catch (e) {
      console.error("태스크 삭제 실패", e);
    }
  };

  const shouldShowTimeField = !isReadOnly || Boolean(task?.time);

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle mode={currentMode} />
      <Space10 direction="mb" />

      <TaskInput
        value={taskInput}
        onChange={setTaskInput}
        disabled={isReadOnly}
      />
      <Space8 direction="mb" />

      <DateField
        value={taskDate}
        onChange={setTaskDate}
        disabled={isReadOnly}
      />
      <Space10 direction="mb" />

      <CategoryField
        value={selectedCategoryId}
        categories={categories}
        onChange={setSelectedCategoryId}
        disabled={isReadOnly}
      />
      <Space10 direction="mb" />

      {shouldShowTimeField && (
        <>
          <TimeField
            enabled={timeEnabled}
            value={taskTime}
            onToggle={(v) => {
              setTimeEnabled(v);
              if (v && !taskTime) {
                setTaskTime(DEFAULT_TIME);
              }
            }}
            onChange={setTaskTime}
            disabled={isReadOnly}
          />
          <Space10 direction="mb" />
        </>
      )}
      <ButtonSection
        mode={currentMode}
        onClose={onClose}
        onEdit={() => setCurrentMode("EDIT")}
        onSubmit={
          currentMode === "CREATE" ? handleCreateTask : handleUpdateTask
        }
        onDelete={handleDeleteTask}
      />
    </ModalWrapper>
  );
}

import { Space10, Space8 } from "@/shared/ui/Space";
import { useAuth } from "@/shared/hooks/useAuth";
import type { Task } from "@/shared/api/task";
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
import { useTaskModalHandlers } from "./hooks/useTaskModalHandlers";

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
  const {
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
    defaultTime,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  } = useTaskModalHandlers({
    mode,
    task,
    selectedDate,
    categoryId,
    categoryColor,
    categories,
    onClose,
    userId: user?.uid,
  });

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle mode={currentMode} />
      <Space10 direction="mb" />

      <TaskInput
        value={taskInput}
        onChange={setTaskInput}
        onEnter={() => {
          if (currentMode === "CREATE") {
            handleCreateTask();
            return;
          }
          if (currentMode === "EDIT") {
            handleUpdateTask();
          }
        }}
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
                setTaskTime(defaultTime);
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

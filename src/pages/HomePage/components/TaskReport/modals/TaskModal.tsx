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
} from "../components/TaskModalFields";
import { ButtonSection } from "../components/TaskModalButtons";
import { useTaskModalHandlers } from "../hooks/useTaskModalHandlers";
import { Text3 } from "@/shared/ui/Text";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { useState } from "react";
import { DateSelectModal } from "./DateSelectModal";

interface TaskModalProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  task?: Task;
  isCompleted?: boolean;
  onToggleCompleted?: (taskId: string) => void;
  selectedDate: string;
  categoryId: string;
  categoryColor: string;
  categories: Category[];
  onClose: () => void;
}

/**
 * 할 일 생성/조회/수정을 공통으로 처리하는 모달입니다.
 */
export default function TaskModal({
  mode,
  task,
  isCompleted,
  onToggleCompleted,
  selectedDate,
  categoryId,
  categoryColor,
  categories,
  onClose,
}: TaskModalProps) {
  const [isMoveDateModalOpen, setIsMoveDateModalOpen] = useState(false);
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
    handleMoveTask,
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

      {isReadOnly ? (
        <div className="flex items-center justify-between gap-3">
          <Text3 text={taskInput} className="font-semibold" />
          <button
            type="button"
            className="shrink-0"
            onClick={() => {
              if (!task || !onToggleCompleted) return;
              onToggleCompleted(task.id);
            }}
            aria-label={isCompleted ? "완료 해제" : "완료 처리"}
          >
            {isCompleted ? (
              <FaCheckCircle size={20} color={categoryColor} />
            ) : (
              <LuCircleDashed size={20} color={categoryColor} />
            )}
          </button>
        </div>
      ) : (
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
      )}
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
        onMove={() => setIsMoveDateModalOpen(true)}
        onSubmit={
          currentMode === "CREATE" ? handleCreateTask : handleUpdateTask
        }
        onDelete={handleDeleteTask}
      />

      {isMoveDateModalOpen && (
        <DateSelectModal
          action="after"
          initialDate={new Date()}
          onClose={() => setIsMoveDateModalOpen(false)}
          onConfirm={(date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            handleMoveTask(`${yyyy}-${mm}-${dd}`);
          }}
        />
      )}
    </ModalWrapper>
  );
}

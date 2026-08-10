import { Space10, Space8 } from "@/shared/ui/Space";
import { useAuth } from "@/shared/hooks/useAuth";
import type { Task } from "@/shared/api/task";
import { ModalWrapper } from "@/shared/ui/Modal";
import type { Category } from "@/shared/api/category";
import {
  CategoryField,
  DateField,
  TaskInput,
  TimeField,
} from "../components/TaskModalFields";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { getModalModeTitle } from "@/shared/utils/getModalModeTitle";
import { ButtonSection } from "../components/TaskModalButtons";
import { useTaskModalHandlers } from "../hooks/useTaskModalHandlers";
import { Text } from "@/shared/ui/primitives";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { useState } from "react";
import { DateSelectModal } from "./DateSelectModal";

interface TaskModalProps {
  mode: "VIEW" | "EDIT";
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
 * 할 일 조회/수정을 공통으로 처리하는 모달입니다.
 * 생성은 목록의 인라인 입력이 전담합니다.
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
    isSubmitting,
    shouldShowTimeField,
    defaultTime,
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
    <ModalWrapper onClose={isSubmitting ? () => {} : onClose}>
      <ModalTitle text={getModalModeTitle(currentMode, "태스크")} />

      {isReadOnly ? (
        <div className="flex items-center justify-between gap-3">
          <Text
            variant="body"
            className="min-w-0 font-semibold wrap-break-word"
          >
            {taskInput}
          </Text>
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
            if (currentMode === "EDIT") {
              void handleUpdateTask();
            }
          }}
          disabled={isReadOnly || isSubmitting}
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
        isSubmitting={isSubmitting}
        onClose={onClose}
        onEdit={() => setCurrentMode("EDIT")}
        onMove={() => setIsMoveDateModalOpen(true)}
        onSubmit={() => {
          void handleUpdateTask();
        }}
        onDelete={() => void handleDeleteTask()}
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
            void handleMoveTask(`${yyyy}-${mm}-${dd}`);
          }}
        />
      )}
    </ModalWrapper>
  );
}

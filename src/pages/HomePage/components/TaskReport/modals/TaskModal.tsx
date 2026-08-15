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
import { Stack, Text } from "@/shared/ui/primitives";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { useState } from "react";
import { DateSelectModal } from "./DateSelectModal";
import { getCategoryTextColor } from "@/shared/constants/colors";
import { useEditModalExit } from "@/shared/hooks/useEditModalExit";
import { UnsavedChangesConfirm } from "@/shared/ui/UnsavedChangesConfirm";

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
    isDirty,
    isSubmitting,
    shouldShowTimeField,
    defaultTime,
    handleUpdateTask,
    handleCancelEdit,
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

  const { isGuardOpen, requestClose, confirmClose, cancelClose, cancelEdit } =
    useEditModalExit({
      isEditingFromDetail: mode === "VIEW" && currentMode === "EDIT",
      isDirty,
      onRevertToDetail: handleCancelEdit,
      onClose,
    });

  return (
    <ModalWrapper onClose={isSubmitting ? () => {} : requestClose}>
      <ModalTitle text={getModalModeTitle(currentMode, "태스크")} />

      {/* 제목 아래 여백은 ModalTitle 이 소유하고, 본문 안의 간격은 이 Stack 이 소유한다 */}
      <Stack gap={8}>
        {isReadOnly ? (
          <Stack gap={3} direction="row" align="center" justify="between">
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
                <FaCheckCircle
                  size={20}
                  color={getCategoryTextColor(categoryColor)}
                />
              ) : (
                <LuCircleDashed
                  size={20}
                  color={getCategoryTextColor(categoryColor)}
                />
              )}
            </button>
          </Stack>
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

        <Stack gap={10}>
          <DateField
            value={taskDate}
            onChange={setTaskDate}
            disabled={isReadOnly}
          />

          <CategoryField
            value={selectedCategoryId}
            categories={categories}
            onChange={setSelectedCategoryId}
            disabled={isReadOnly}
          />

          {shouldShowTimeField && (
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
          )}
        </Stack>

        <ButtonSection
          mode={currentMode}
          isSubmitting={isSubmitting}
          onClose={requestClose}
          onCancel={cancelEdit}
          onEdit={() => setCurrentMode("EDIT")}
          onMove={() => setIsMoveDateModalOpen(true)}
          canSubmit={isDirty}
          onSubmit={() => {
            void handleUpdateTask();
          }}
          onDelete={() => void handleDeleteTask()}
        />
      </Stack>

      {isGuardOpen && (
        <UnsavedChangesConfirm
          onConfirm={confirmClose}
          onClose={cancelClose}
        />
      )}

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

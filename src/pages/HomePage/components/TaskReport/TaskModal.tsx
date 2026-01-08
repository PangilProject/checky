import { useState } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import { Space10, Space8 } from "@/shared/ui/Space";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  createTask,
  deleteTaskWithLogs,
  type Task,
  updateTaskWithDateMove,
} from "@/shared/api/task";
import { ModalWrapper } from "@/shared/ui/Modal";

interface TaskModalProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  task?: Task;
  selectedDate: string;
  categoryId: string;
  categoryColor: string;
  onClose: () => void;
}

export default function TaskModal({
  mode,
  task,
  selectedDate,
  categoryId,
  categoryColor,
  onClose,
}: TaskModalProps) {
  const { user } = useAuth();

  const [taskInput, setTaskInput] = useState(task?.title ?? "");
  const [taskDate, setTaskDate] = useState(task?.date ?? selectedDate);
  const DEFAULT_TIME = "12:30";

  const [timeEnabled, setTimeEnabled] = useState<boolean>(Boolean(task?.time));

  const [taskTime, setTaskTime] = useState<string>(task?.time ?? DEFAULT_TIME);
  const [currentMode, setCurrentMode] = useState(mode);

  const isReadOnly = currentMode === "VIEW";

  /* ======================
     CREATE
  ====================== */
  const handleCreateTask = async () => {
    if (!taskInput.trim() || !user) return;

    try {
      await createTask({
        userId: user.uid,
        title: taskInput,
        categoryId,
        categoryColor,
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
    if (!task || !taskInput.trim() || !user) return;

    try {
      await updateTaskWithDateMove({
        userId: user.uid,
        taskId: task.id,
        title: taskInput,
        ...(timeEnabled ? { time: taskTime } : { time: undefined }),
        prevDate: task.date,
        nextDate: taskDate,
        categoryId,
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

/* ======================
   Sub Components
====================== */

const ModalTitle = ({ mode }: { mode: "CREATE" | "VIEW" | "EDIT" }) => {
  if (mode === "CREATE")
    return <Text5 text="태스크 추가" className="font-bold" />;
  if (mode === "EDIT")
    return <Text5 text="태스크 수정" className="font-bold" />;
  return <Text5 text="태스크 상세" className="font-bold" />;
};

const TaskInput = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  return (
    <input
      className="w-full border-0 border-b border-gray-300 text-[16px] outline-none"
      placeholder="할 일을 입력하세요"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const DateField = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex justify-between items-center">
      <Text3 text="날짜" />
      {disabled ? (
        <Text3 text={value} className="opacity-60" />
      ) : (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-b border-gray-300 outline-none text-[14px]"
        />
      )}
    </div>
  );
};

const TimeField = ({
  enabled,
  value,
  onToggle,
  onChange,
  disabled,
}: {
  enabled: boolean;
  value: string;
  onToggle: (v: boolean) => void;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex justify-between items-center">
      <Text3 text="시간" />
      {disabled ? (
        enabled && <Text3 text={value} className="opacity-60" />
      ) : (
        <div className="flex items-center gap-3">
          {/* 선택 버튼 (체크박스 역할) */}
          <button
            type="button"
            onClick={() => onToggle(!enabled)}
            className={`text-xs px-2 py-1 rounded border
              ${
                enabled
                  ? "border-black text-black"
                  : "border-gray-300 text-gray-400"
              }`}
          >
            {enabled ? "삭제" : "선택"}
          </button>

          {/* time input */}
          <input
            type="time"
            value={value}
            disabled={!enabled}
            onChange={(e) => onChange(e.target.value)}
            className={`border-b outline-none text-[14px]
              ${!enabled && "opacity-40"}`}
          />
        </div>
      )}
    </div>
  );
};

interface ButtonSectionProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
}

const ButtonSection = ({
  mode,
  onClose,
  onEdit,
  onSubmit,
  onDelete,
}: ButtonSectionProps) => {
  if (mode === "VIEW") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
        <NormalRedUnFillButton text="삭제" onClick={onDelete} />
        <NormalBlackButton text="수정" onClick={onEdit} />
      </div>
    );
  }

  if (mode === "EDIT") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="취소" onClick={onClose} />
        <NormalBlackButton text="저장" onClick={onSubmit} />
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton text="닫기" onClick={onClose} />
      <NormalBlackButton text="완료" onClick={onSubmit} />
    </div>
  );
};

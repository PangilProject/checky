import { useEffect, useRef, useState } from "react";
import { getCategoryColor } from "@/shared/constants/colors";
import { Button, Input, Stack } from "@/shared/ui/primitives";
import { LuCircleDashed } from "react-icons/lu";

interface AddTaskInputProps {
  categoryColor: string;
  onAddTask: (title: string) => void;
  onBlurClose: () => void;
}

export const AddTaskInput = ({
  categoryColor,
  onAddTask,
  onBlurClose,
}: AddTaskInputProps) => {
  const [taskInput, setTaskInput] = useState("");
  // 저장된 hex 가 아니라 테마에 맞게 고른 색으로 그린다
  const color = getCategoryColor(categoryColor);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isSubmittingRef.current) {
      return;
    }

    const nextFocused = e.relatedTarget as Node | null;
    if (containerRef.current?.contains(nextFocused)) {
      return;
    }

    onBlurClose();
  };

  const handleSubmit = () => {
    if (!taskInput.trim()) return;

    isSubmittingRef.current = true;
    onAddTask(taskInput);
    setTaskInput("");

    requestAnimationFrame(() => {
      isSubmittingRef.current = false;
    });
  };

  return (
    <Stack
      gap={2}
      direction="row"
      align="end"
      className="min-w-0"
      ref={containerRef}
    >
      <div className="shrink-0">
        <LuCircleDashed size={20} color={color} />
      </div>
      <Input
        ref={inputRef}
        style={{ borderColor: color }}
        className="flex-1 min-w-0"
        value={taskInput}
        maxLength={100}
        aria-label="할 일 입력"
        onChange={(e) => setTaskInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.nativeEvent.isComposing) return;
            handleSubmit();
          }
        }}
        onBlur={handleBlur}
      />
      <div
        className="shrink-0 flex items-center"
        onMouseDown={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Button size="none" className="h-7 w-15 text-xs">
          추가
        </Button>
      </div>
    </Stack>
  );
};

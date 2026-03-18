import { useEffect, useRef, useState } from "react";
import { COLOR_CLASS_BORDER_MAP } from "@/shared/constants/colors";
import { LongBlackButton } from "@/shared/ui/Button";
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
  const borderColor = COLOR_CLASS_BORDER_MAP[categoryColor];
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const [isComposing, setIsComposing] = useState(false);

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
    <div className="flex items-end gap-2 min-w-0" ref={containerRef}>
      <div className="shrink-0">
        <LuCircleDashed size={20} color={categoryColor} />
      </div>
      <input
        ref={inputRef}
        className={`outline-none border-b flex-1 min-w-0 ${borderColor} ${
          isComposing ? "ime-fallback" : "font-paperlogy"
        }`}
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        onCompositionStart={() => {
          isComposingRef.current = true;
          setIsComposing(true);
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          setIsComposing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (isComposingRef.current) return;
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
        <LongBlackButton
          text="추가"
          className="text-[12px]"
          width="w-15"
          height="h-7"
        />
      </div>
    </div>
  );
};

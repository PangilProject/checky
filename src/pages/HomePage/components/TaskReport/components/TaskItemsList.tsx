import { Text } from "@/shared/ui/primitives";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import type { Task } from "@/shared/api/task";
import type { TaskLog } from "@/shared/api/taskLog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DAY_MS = 24 * 60 * 60 * 1000;

const getElapsedDaysLabel = (createdAt?: Date) => {
  if (!createdAt) return null;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const createdStart = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth(),
    createdAt.getDate(),
  );
  const diffDays = Math.max(
    0,
    Math.floor((todayStart.getTime() - createdStart.getTime()) / DAY_MS),
  );

  if (diffDays === 0) return "D-Day";
  return `D+${diffDays}`;
};

interface TaskListProps {
  tasks: Task[];
  categoryColor: string;
  taskLogMap: Map<string, TaskLog>;
  onToggle: (taskId: string) => void;
  onClickTask: (task: Task) => void;
}

export const TaskItemsList = ({
  tasks,
  categoryColor,
  taskLogMap,
  onToggle,
  onClickTask,
}: TaskListProps) => {
  // 분류를 방금 만든 직후가 가장 허전한 지점이다. 빈 자리를 그대로 두면
  // 옆의 작은 + 아이콘이 유일한 단서라, 무엇을 해야 할지 알기 어렵다.
  if (tasks.length === 0) {
    return (
      <p className="py-2 pl-1 text-[13px] text-content-muted">
        + 를 눌러 할 일을 추가해보세요.
      </p>
    );
  }

  return (
    <>
      {tasks.map((task) => {
        const completed = taskLogMap.get(task.id)?.completed;

        return (
          <SortableTaskItem
            key={task.id}
            task={task}
            categoryColor={categoryColor}
            completed={completed}
            onToggle={onToggle}
            onClickTask={onClickTask}
          />
        );
      })}
    </>
  );
};

interface SortableTaskItemProps {
  task: Task;
  categoryColor: string;
  completed?: boolean;
  onToggle: (taskId: string) => void;
  onClickTask: (task: Task) => void;
}

const SortableTaskItem = ({
  task,
  categoryColor,
  completed,
  onToggle,
  onClickTask,
}: SortableTaskItemProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const elapsedDays = getElapsedDaysLabel(task.createdAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
          py-1 flex justify-between cursor-grab 
          ${isDragging ? "bg-surface-sunken shadow-md scale-[1.02]" : ""}
        `}
    >
      <div className="flex flex-col min-w-0" onClick={() => onToggle(task.id)}>
        <div className="flex gap-2 items-start min-w-0">
          <div className="shrink-0 mt-0.5">
            {completed ? (
              <FaCheckCircle size={20} color={categoryColor} />
            ) : (
              <LuCircleDashed size={20} color={categoryColor} />
            )}
          </div>

          <Text
            variant="body"
            className={`min-w-0 wrap-break-words whitespace-normal ${
              completed ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </Text>
        </div>
        <div className="flex pl-6">
          {task.time && (
            <Text variant="caption" tone="muted" className="ml-1">
              {task.time}
            </Text>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-12 text-left">
          {elapsedDays && (
            <Text variant="caption" tone="muted">
              {elapsedDays}
            </Text>
          )}
        </div>
        <button
          className="pressable"
          onClick={(e) => {
            e.stopPropagation();
            onClickTask(task);
          }}
        >
          <HiDotsHorizontal color="var(--color-content-muted)" size={20} />
        </button>
      </div>
    </div>
  );
};

import { Space6 } from "@/shared/ui/Space";
import { Text1, Text3 } from "@/shared/ui/Text";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import type { Task } from "@/shared/api/task";
import type { TaskLog } from "@/shared/api/taskLog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  if (tasks.length === 0) return null;

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
          py-1 flex justify-between cursor-grab 
          ${isDragging ? "bg-gray-100 shadow-md scale-[1.02]" : ""}
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

          <Text3
            text={task.title}
            className={`min-w-0 wrap-break-words whitespace-normal ${
              completed ? "line-through opacity-60" : ""
            }`}
          />
        </div>
        <div className="flex">
          <Space6 direction="mr" />
          {task.time && (
            <Text1 text={task.time} className="ml-1 text-[#8E8E93]" />
          )}
        </div>
      </div>

      <button
        className="pressable"
        onClick={(e) => {
          e.stopPropagation();
          onClickTask(task);
        }}
      >
        <HiDotsHorizontal color="#8E8E93" size={20} />
      </button>
    </div>
  );
};

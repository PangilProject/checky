import { useEffect, useRef, useState } from "react";
import { useRenderCounter } from "@/shared/perf";
import { COLOR_CLASS_BORDER_MAP, COLOR_CLASS_TEXT_MAP } from "@/shared/constants/color";
import { Space10, Space6, Space8 } from "@/shared/ui/Space";
import { Text1, Text3, Text4 } from "@/shared/ui/Text";
import { LongBlackButton } from "@/shared/ui/Button";
import { FaCirclePlus } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import TaskModal from "../TaskModal";
import type { Category } from "@/shared/api/category";
import type { Task } from "@/shared/api/task";
import type { TaskLog } from "@/shared/api/taskLog";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface TaskCategorySectionProps {
  category: Category;
  tasks: Task[];
  taskLogMap: Map<string, TaskLog>;
  dateString: string;
  onAddTask: (args: {
    title: string;
    categoryId: string;
    categoryColor: string;
  }) => void;
  onToggleTask: (taskId: string) => void;
  onReorder: (categoryId: string, nextTasks: Task[]) => void;
}

export const TaskCategorySection = ({
  category,
  tasks,
  taskLogMap,
  dateString,
  onAddTask,
  onToggleTask,
  onReorder,
}: TaskCategorySectionProps) => {
  useRenderCounter(`CategoryItem:${category.id}`);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const filteredTasks = tasks
    .filter((task) => task.categoryId === category.id && task.date === dateString)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredTasks.findIndex((task) => task.id === active.id);
    const newIndex = filteredTasks.findIndex((task) => task.id === over.id);

    const newList = arrayMove(filteredTasks, oldIndex, newIndex);

    onReorder(category.id, newList);
  };

  const handleOpenTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setSelectedTask(undefined);
    setIsTaskModalOpen(false);
  };

  return (
    <div>
      <AddCategory
        categoryName={category.name}
        categoryColor={category.color}
        onClick={() => setIsAddOpen(true)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={filteredTasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <TaskList
            tasks={filteredTasks}
            categoryColor={category.color}
            taskLogMap={taskLogMap}
            onToggle={onToggleTask}
            onClickTask={handleOpenTaskModal}
          />
        </SortableContext>
      </DndContext>

      {isAddOpen && (
        <AddTaskInput
          categoryColor={category.color}
          onAddTask={(title) =>
            onAddTask({
              title,
              categoryId: category.id,
              categoryColor: category.color,
            })
          }
          onBlurClose={() => setIsAddOpen(false)}
        />
      )}

      <Space8 direction="mb" />

      {isTaskModalOpen && selectedTask && (
        <TaskModal
          mode="VIEW"
          task={selectedTask}
          selectedDate={dateString}
          categoryId={category.id}
          categoryColor={category.color}
          onClose={handleCloseTaskModal}
        />
      )}
    </div>
  );
};

interface AddCategoryProps {
  categoryName: string;
  categoryColor: string;
  onClick: () => void;
}

const AddCategory = ({ categoryName, categoryColor, onClick }: AddCategoryProps) => {
  const textColor = COLOR_CLASS_TEXT_MAP[categoryColor];
  return (
    <div className="flex gap-2 items-center" onClick={onClick}>
      <Text4 text={categoryName} className={`${textColor} font-bold`} />
      <FaCirclePlus size={15} color={categoryColor} className="pressable" />
      <Space10 direction="mb" />
    </div>
  );
};

const TaskList = ({
  tasks,
  categoryColor,
  taskLogMap,
  onToggle,
  onClickTask,
}: {
  categoryColor: string;
  tasks: Task[];
  taskLogMap: Map<string, TaskLog>;
  onToggle: (taskId: string) => void;
  onClickTask: (task: Task) => void;
}) => {
  useRenderCounter("TaskList");
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
  useRenderCounter(`SortableTaskItem:${task.id}`);
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

interface AddTaskInputProps {
  categoryColor: string;
  onAddTask: (title: string) => void;
  onBlurClose: () => void;
}

const AddTaskInput = ({
  categoryColor,
  onAddTask,
  onBlurClose,
}: AddTaskInputProps) => {
  useRenderCounter("AddTaskInput");
  const [taskInput, setTaskInput] = useState("");
  const borderColor = COLOR_CLASS_BORDER_MAP[categoryColor];
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

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
        className={`outline-none border-b flex-1 min-w-0 ${borderColor}`}
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
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
        <LongBlackButton text="추가" className="text-[12px]" width="w-15" height="h-7" />
      </div>
    </div>
  );
};

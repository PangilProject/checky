import { getCategories, type Category } from "@/shared/api/category";
import {
  COLOR_CLASS_BORDER_MAP,
  COLOR_CLASS_TEXT_MAP,
} from "@/shared/constants/color";
import { useAuth } from "@/shared/hooks/useAuth";
import { Space10, Space6, Space8 } from "@/shared/ui/Space";
import { Text1, Text3, Text4 } from "@/shared/ui/Text";
import { useEffect, useRef, useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { LongBlackButton } from "@/shared/ui/Button";
import {
  createTask,
  getTasksByDate,
  updateTaskOrder,
  type Task,
} from "@/shared/api/task";
import {
  getTaskLogsByDate,
  toggleTaskLog,
  type TaskLog,
} from "@/shared/api/taskLog";
import { HiDotsHorizontal } from "react-icons/hi";
import TaskModal from "./TaskModal";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateByDate } from "@/shared/hooks/formatDate";
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
import { useRenderCounter } from "@/shared/perf";

export const TaskListSection = () => {
  useRenderCounter("TaskListSection");
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const status = "ACTIVE";
  useEffect(() => {
    if (!user) return;

    const unsubscribe = getCategories({
      userId: user.uid,
      status,
      onChange: setCategories,
    });

    return () => unsubscribe();
  }, [user, status]);

  return (
    <div className="flex flex-col w-full">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          categoryName={category.name}
          categoryColor={category.color}
          categoryId={category.id}
        />
      ))}
    </div>
  );
};

interface CategoryItemProps {
  categoryName: string;
  categoryColor: string;
  categoryId: string;
}
const CategoryItem = ({
  categoryId,
  categoryName,
  categoryColor,
}: CategoryItemProps) => {
  useRenderCounter(`CategoryItem:${categoryId}`);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const tempIdRef = useRef(0);

  const handleOpenTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setSelectedTask(undefined);
    setIsTaskModalOpen(false);
  };

  const { user } = useAuth();
  const { selectedDate } = useSelectedDate();
  const dateString = formatDateByDate(selectedDate);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getTasksByDate({
      userId: user.uid,
      date: dateString,
      onChange: setTasks,
    });

    return () => unsubscribe();
  }, [user, dateString]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getTaskLogsByDate({
      userId: user.uid,
      date: dateString,
      onChange: setTaskLogs,
    });

    return () => unsubscribe();
  }, [user, dateString]);

  const taskLogMap = new Map(taskLogs.map((log) => [log.taskId, log]));

  const handleToggleTask = async (taskId: string) => {
    if (!user) return;

    const currentLog = taskLogMap.get(taskId);

    await toggleTaskLog({
      userId: user.uid,
      taskId,
      date: dateString,
      currentLog,
    });
  };

  const filteredTasks = tasks
    .filter(
      (task) => task.categoryId === categoryId && task.date === dateString
    )
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const handleAddTask = async (title: string) => {
    if (!title.trim() || !user) return;

    tempIdRef.current += 1;
    const tempId = `temp-${tempIdRef.current}`;

    const optimisticTask: Task = {
      id: tempId,
      title,
      categoryId,
      categoryColor,
      date: dateString,
      orderIndex: filteredTasks.length,
    };

    setTasks((prev) => [...prev, optimisticTask]);
    // setIsAddOpen(false);

    try {
      const savedTask = await createTask({
        userId: user.uid,
        title,
        categoryId,
        categoryColor,
        date: dateString,
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === tempId ? savedTask : task))
      );
    } catch (error) {
      setTasks((prev) => prev.filter((task) => task.id !== tempId));
      console.error("Failed to create task", error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredTasks.findIndex((t) => t.id === active.id);
    const newIndex = filteredTasks.findIndex((t) => t.id === over.id);

    const newList = arrayMove(filteredTasks, oldIndex, newIndex);

    // 1️⃣ UI 반영
    setTasks((prev) => {
      const others = prev.filter(
        (t) => t.categoryId !== categoryId || t.date !== dateString
      );

      return [
        ...others,
        ...newList.map((t, index) => ({
          ...t,
          orderIndex: index,
        })),
      ];
    });

    // 2️⃣ DB 반영
    updateTaskOrder({
      userId: user!.uid,
      tasks: newList.map((t, index) => ({
        id: t.id,
        orderIndex: index,
      })),
    });
  };

  return (
    <div>
      <AddCategory
        categoryName={categoryName}
        categoryColor={categoryColor}
        onClick={() => setIsAddOpen(true)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={filteredTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <TaskList
            tasks={filteredTasks}
            categoryColor={categoryColor}
            taskLogMap={taskLogMap}
            onToggle={handleToggleTask}
            onClickTask={handleOpenTaskModal}
          />
        </SortableContext>
      </DndContext>

      {isAddOpen && (
        <AddTaskInput
          categoryColor={categoryColor}
          onAddTask={handleAddTask}
          onBlurClose={() => setIsAddOpen(false)}
        />
      )}

      <Space8 direction="mb" />

      {isTaskModalOpen && selectedTask && (
        <TaskModal
          mode="VIEW"
          task={selectedTask}
          selectedDate={dateString}
          categoryId={categoryId}
          categoryColor={categoryColor}
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
const AddCategory = ({
  categoryName,
  categoryColor,
  onClick,
}: AddCategoryProps) => {
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
          {/* 아이콘은 고정 */}
          <div className="shrink-0 mt-0.5">
            {completed ? (
              <FaCheckCircle size={20} color={categoryColor} />
            ) : (
              <LuCircleDashed size={20} color={categoryColor} />
            )}
          </div>

          {/* 텍스트는 여러 줄 허용 */}
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isSubmittingRef.current) {
      return; // ⭐ submit 중이면 blur 무시
    }

    const nextFocused = e.relatedTarget as Node | null;
    if (containerRef.current?.contains(nextFocused)) {
      return;
    }

    onBlurClose();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!taskInput.trim()) return;

    isSubmittingRef.current = true;
    onAddTask(taskInput);
    setTaskInput("");

    // 다음 tick에서 ref 초기화
    requestAnimationFrame(() => {
      isSubmittingRef.current = false;
    });
  };

  const isComposingRef = useRef(false);

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
            // ⭐ 조합 중이면 Enter 무시
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

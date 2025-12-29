import { getCategories, type Category } from "@/shared/api/category";
import {
  COLOR_CLASS_BORDER_MAP,
  COLOR_CLASS_TEXT_MAP,
} from "@/shared/constants/color";
import { useAuth } from "@/shared/hooks/useAuth";
import { Space10, Space8 } from "@/shared/ui/Space";
import { Text3, Text4 } from "@/shared/ui/Text";
import { useEffect, useRef, useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { LongBlackButton } from "@/shared/ui/Button";
import { createTask, getTasksByDate, type Task } from "@/shared/api/task";
import {
  getTaskLogsByDate,
  toggleTaskLog,
  type TaskLog,
} from "@/shared/api/taskLog";
import { HiDotsHorizontal } from "react-icons/hi";
import TaskModal from "./TaskModal";
import { useSelectedDate } from "@/shared/contexts/DateContext";
import { formatDateByDate } from "@/shared/hooks/formatDate";

export const TaskListSection = () => {
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

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

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getTasksByDate({
      userId: user.uid,
      date: dateString,
      onChange: setTasks,
    });

    return () => unsubscribe();
  }, [user, selectedDate]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getTaskLogsByDate({
      userId: user.uid,
      date: dateString,
      onChange: setTaskLogs,
    });

    return () => unsubscribe();
  }, [user, selectedDate]);

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

  const filteredTasks = tasks.filter(
    (task) => task.categoryId === categoryId && task.date === dateString
  );

  const handleAddTask = async (title: string) => {
    if (!title.trim() || !user) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticTask: Task = {
      id: tempId,
      title,
      categoryId,
      categoryColor,
      date: dateString,
    };

    setTasks((prev) => [...prev, optimisticTask]);
    setIsAddOpen(false);

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

  return (
    <div>
      <AddCategory
        categoryName={categoryName}
        categoryColor={categoryColor}
        onClick={() => setIsAddOpen(true)}
      />

      <TaskList
        tasks={filteredTasks}
        categoryColor={categoryColor}
        taskLogMap={taskLogMap}
        onToggle={handleToggleTask}
        onClickTask={handleOpenTaskModal}
      />

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
      <FaCirclePlus size={15} color={categoryColor} />
      <Space10 direction="mb" />
    </div>
  );
};

const TaskList = ({
  categoryColor,
  tasks,
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
  if (tasks.length === 0) return null;

  return (
    <>
      {tasks.map((task) => {
        const log = taskLogMap.get(task.id);
        const completed = log?.completed;

        return (
          <div key={task.id} className="py-1 flex justify-between">
            <div
              className="flex gap-2 items-center cursor-pointer"
              onClick={() => onToggle(task.id)}
            >
              {completed ? (
                <FaCheckCircle size={20} color={categoryColor} />
              ) : (
                <LuCircleDashed size={20} color={categoryColor} />
              )}
              <Text3
                text={task.title}
                className={completed ? "line-through opacity-60" : ""}
              />
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
      })}
    </>
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

  return (
    <div className="flex items-end gap-2" ref={containerRef}>
      <LuCircleDashed size={26} color={categoryColor} />
      <input
        ref={inputRef}
        className={`outline-none border-b w-full ${borderColor}`}
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        onBlur={handleBlur}
      />
      <div
        className="flex items-center"
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

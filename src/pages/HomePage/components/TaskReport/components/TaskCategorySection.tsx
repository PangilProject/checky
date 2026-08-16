import { useState } from "react";
import TaskModal from "../modals/TaskModal";
import type { Category } from "@/shared/api/category";
import type { Task } from "@/shared/api/task";
import type { TaskLog } from "@/shared/api/taskLog";
import { SortableList } from "@/shared/ui/SortableList";
import { AddCategory } from "./AddCategory";
import { AddTaskInput } from "./AddTaskInput";
import { TaskItemsList } from "./TaskItemsList";

interface TaskCategorySectionProps {
  category: Category;
  /** 새 할 일을 넣을 수 있는 분류. 종료한 것은 들어 있지 않다. */
  selectableCategories: Category[];
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
  selectableCategories,
  tasks,
  taskLogMap,
  dateString,
  onAddTask,
  onToggleTask,
  onReorder,
}: TaskCategorySectionProps) => {
  // 종료한 분류는 이미 들어 있는 할 일만 보여 준다. 새로 넣지는 못한다.
  const isEnded = category.status !== "ACTIVE";

  // 모달의 분류 목록에는 이 할 일이 속한 분류가 반드시 있어야 한다.
  // 없으면 종료된 분류의 할 일을 열었을 때 분류 칸이 비어 보인다.
  // 다른 분류로 옮기는 것은 되고, 다른 할 일을 여기로 옮기지는 못한다.
  const modalCategories = isEnded
    ? [...selectableCategories, category]
    : selectableCategories;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const filteredTasks = tasks
    .filter(
      (task) => task.categoryId === category.id && task.date === dateString,
    )
    .sort((a, b) => a.orderIndex - b.orderIndex);

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
        canAdd={!isEnded}
        onClick={() => setIsAddOpen(true)}
      />

      <SortableList
        items={filteredTasks}
        getId={(task) => task.id}
        onReorder={(nextTasks) => onReorder(category.id, nextTasks)}
      >
        <TaskItemsList
          tasks={filteredTasks}
          categoryColor={category.color}
          taskLogMap={taskLogMap}
          onToggle={onToggleTask}
          onClickTask={handleOpenTaskModal}
        />
      </SortableList>

      {isAddOpen && !isEnded && (
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

      {isTaskModalOpen && selectedTask && (
        <TaskModal
          mode="VIEW"
          task={selectedTask}
          isCompleted={taskLogMap.get(selectedTask.id)?.completed ?? false}
          onToggleCompleted={onToggleTask}
          selectedDate={dateString}
          categoryId={category.id}
          categoryColor={category.color}
          categories={modalCategories}
          onClose={handleCloseTaskModal}
        />
      )}
    </div>
  );
};

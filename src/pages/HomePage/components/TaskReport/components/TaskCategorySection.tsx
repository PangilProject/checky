import { useState } from "react";
import { Space8 } from "@/shared/ui/Space";
import TaskModal from "../modals/TaskModal";
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
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { AddCategory } from "./AddCategory";
import { AddTaskInput } from "./AddTaskInput";
import { TaskItemsList } from "./TaskItemsList";

interface TaskCategorySectionProps {
  category: Category;
  categories: Category[];
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
  categories,
  tasks,
  taskLogMap,
  dateString,
  onAddTask,
  onToggleTask,
  onReorder,
}: TaskCategorySectionProps) => {
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
          <TaskItemsList
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
          categories={categories}
          onClose={handleCloseTaskModal}
        />
      )}
    </div>
  );
};

import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateByDate } from "@/shared/hooks/formatDate";
import { useTaskList } from "./hooks/useTaskList";
import { TaskCategorySection } from "./components/TaskCategorySection";

export const TaskListSection = () => {
  const { user } = useAuth();
  const { selectedDate } = useSelectedDate();
  const dateString = formatDateByDate(selectedDate);

  const { categories, tasks, taskLogMap, addTask, toggleTask, reorderTasks } =
    useTaskList({
      userId: user?.uid,
      dateString,
    });

  return (
    <div className="flex flex-col w-full">
      {categories.map((category) => (
        <TaskCategorySection
          key={category.id}
          category={category}
          tasks={tasks}
          taskLogMap={taskLogMap}
          dateString={dateString}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onReorder={(categoryId, nextTasks) =>
            reorderTasks({ categoryId, nextTasks })
          }
        />
      ))}
    </div>
  );
};

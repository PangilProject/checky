import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateByDate } from "@/shared/hooks/formatDate";
import { useTaskList } from "./hooks/useTaskList";
import { TaskCategorySection } from "./components/TaskCategorySection";
import { TaskListSkeleton } from "./components/TaskListSkeleton";
import { useEffect } from "react";

export const TaskListSection = ({
  onReadyRefresh,
}: {
  onReadyRefresh?: (refresh: () => Promise<void>) => void;
}) => {
  const { user } = useAuth();
  const { selectedDate } = useSelectedDate();
  const dateString = formatDateByDate(selectedDate);

  const {
    categories,
    tasks,
    taskLogMap,
    isLoading,
    addTask,
    toggleTask,
    reorderTasks,
    refresh,
  } =
    useTaskList({
      userId: user?.uid,
      dateString,
    });

  useEffect(() => {
    onReadyRefresh?.(refresh);
  }, [onReadyRefresh, refresh]);

  return (
    <div className="flex flex-col w-full">
      {isLoading ? (
        <TaskListSkeleton />
      ) : (
        <>
          {categories.map((category) => (
            <TaskCategorySection
              key={category.id}
              category={category}
              categories={categories}
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
        </>
      )}
    </div>
  );
};

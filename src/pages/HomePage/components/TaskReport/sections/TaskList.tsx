import { useAuth } from "@/shared/hooks/useAuth";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { formatDateToYmd } from "@/shared/hooks/formatDate";
import { useTaskList } from "../hooks/useTaskList";
import { TaskCategorySection } from "../components/TaskCategorySection";
import { TaskListSkeleton } from "../components/TaskListSkeleton";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Text2 } from "@/shared/ui/Text";

/**
 * 선택 날짜 기준으로 카테고리별 할 일 목록을 렌더링합니다.
 */
export const TaskListSection = ({
  onReadyRefresh,
}: {
  onReadyRefresh?: (refresh: () => Promise<void>) => void;
}) => {
  const { user } = useAuth();
  const { selectedDate } = useSelectedDate();
  const dateString = formatDateToYmd(selectedDate);

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
      ) : categories.length === 0 ? (
        // 카테고리가 없으면 빈 공간만 보이므로 다음 행동을 안내한다
        <div className="flex flex-col items-center gap-2 py-8">
          <Text2 text="아직 카테고리가 없어요." className="text-gray-400" />
          <Text2
            text="카테고리를 먼저 만들어 주세요."
            className="text-gray-400"
          />
          <Link
            to="/category"
            className="mt-1 rounded-md bg-black px-4 py-1 text-sm font-bold text-white"
          >
            카테고리 만들기
          </Link>
        </div>
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

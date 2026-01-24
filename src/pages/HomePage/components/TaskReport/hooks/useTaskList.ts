import { useEffect, useMemo, useRef, useState } from "react";
import { getCategories, type Category } from "@/shared/api/category";
import { createTask, getTasksByDate, updateTaskOrder, type Task } from "@/shared/api/task";
import { getTaskLogsByDate, toggleTaskLog, type TaskLog } from "@/shared/api/taskLog";

export const useTaskList = ({
  userId,
  dateString,
}: {
  userId: string | undefined;
  dateString: string;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const tempIdRef = useRef(0);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = getCategories({
      userId,
      status: "ACTIVE",
      onChange: setCategories,
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = getTasksByDate({
      userId,
      date: dateString,
      onChange: setTasks,
    });

    return () => unsubscribe();
  }, [userId, dateString]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = getTaskLogsByDate({
      userId,
      date: dateString,
      onChange: setTaskLogs,
    });

    return () => unsubscribe();
  }, [userId, dateString]);

  const taskLogMap = useMemo(
    () => new Map(taskLogs.map((log) => [log.taskId, log])),
    [taskLogs]
  );

  const addTask = async ({
    title,
    categoryId,
    categoryColor,
  }: {
    title: string;
    categoryId: string;
    categoryColor: string;
  }) => {
    if (!title.trim() || !userId) return;

    const currentTasks = tasks.filter(
      (task) => task.categoryId === categoryId && task.date === dateString
    );

    tempIdRef.current += 1;
    const tempId = `temp-${tempIdRef.current}`;

    const optimisticTask: Task = {
      id: tempId,
      title,
      categoryId,
      categoryColor,
      date: dateString,
      orderIndex: currentTasks.length,
    };

    setTasks((prev) => [...prev, optimisticTask]);

    try {
      const savedTask = await createTask({
        userId,
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

  const toggleTask = async (taskId: string) => {
    if (!userId) return;

    const currentLog = taskLogMap.get(taskId);

    await toggleTaskLog({
      userId,
      taskId,
      date: dateString,
      currentLog,
    });
  };

  const reorderTasks = ({
    categoryId,
    nextTasks,
  }: {
    categoryId: string;
    nextTasks: Task[];
  }) => {
    if (!userId) return;

    setTasks((prev) => {
      const others = prev.filter(
        (task) => task.categoryId !== categoryId || task.date !== dateString
      );

      return [
        ...others,
        ...nextTasks.map((task, index) => ({
          ...task,
          orderIndex: index,
        })),
      ];
    });

    updateTaskOrder({
      userId,
      tasks: nextTasks.map((task, index) => ({
        id: task.id,
        orderIndex: index,
      })),
    });
  };

  return {
    categories,
    tasks,
    taskLogMap,
    addTask,
    toggleTask,
    reorderTasks,
  };
};

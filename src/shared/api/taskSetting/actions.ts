import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Task } from "@/shared/api/task";
import { taskRef, tasksRef } from "./refs";
import { fetchTasksAndCompleted, getUncompletedTasks } from "./helpers";
import { getTasksByDateOnce } from "./queries";
import type { DateOnlyParams, MoveTasksParams } from "./types";

const updateTasksDate = async ({
  userId,
  tasks,
  toDate,
}: {
  userId: string;
  tasks: Task[];
  toDate: string;
}) => {
  const batch = writeBatch(db);

  tasks.forEach((task) => {
    batch.update(taskRef(userId, task.id), {
      date: toDate,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

/* =========================
   ACTION 1
   미완료 → 오늘로 이동
========================= */
export const moveUncompletedTasksToToday = async ({
  userId,
  fromDate,
  toDate,
}: MoveTasksParams) => {
  const { tasks, completedTaskIds } = await fetchTasksAndCompleted({
    userId,
    date: fromDate,
  });

  const targets = getUncompletedTasks(tasks, completedTaskIds);

  await updateTasksDate({ userId, tasks: targets, toDate });
};

/* =========================
   ACTION 2
   미완료 → 특정 날짜로 이동 (after)
========================= */
export const moveUncompletedTasksToDate = async ({
  userId,
  fromDate,
  toDate,
}: MoveTasksParams) => {
  const { tasks, completedTaskIds } = await fetchTasksAndCompleted({
    userId,
    date: fromDate,
  });

  const targets = getUncompletedTasks(tasks, completedTaskIds);

  await updateTasksDate({ userId, tasks: targets, toDate });
};

/* =========================
   ACTION 3
   미완료 삭제
========================= */
export const deleteUncompletedTasks = async ({
  userId,
  date,
}: DateOnlyParams) => {
  const { tasks, completedTaskIds } = await fetchTasksAndCompleted({
    userId,
    date,
  });

  const targets = getUncompletedTasks(tasks, completedTaskIds);

  const batch = writeBatch(db);

  targets.forEach((task) => {
    batch.delete(taskRef(userId, task.id));
  });

  await batch.commit();
};

/* =========================
   ACTION 4
   모든 할 일 복사
========================= */
export const copyAllTasksToDate = async ({
  userId,
  fromDate,
  toDate,
}: MoveTasksParams) => {
  const tasks = await getTasksByDateOnce({ userId, date: fromDate });

  const batch = writeBatch(db);

  tasks.forEach((task, index) => {
    const nextRef = doc(tasksRef(userId));

    batch.set(nextRef, {
      title: task.title,
      categoryId: task.categoryId,
      categoryColor: task.categoryColor,
      date: toDate,
      ...(task.time && { time: task.time }),
      orderIndex: index, // 👉 새 날짜 기준으로 재정렬
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

/* =========================
   ACTION 5
   모든 할 일 삭제
========================= */
export const deleteAllTasksByDate = async ({
  userId,
  date,
}: DateOnlyParams) => {
  const tasks = await getTasksByDateOnce({ userId, date });

  const batch = writeBatch(db);

  tasks.forEach((task) => {
    batch.delete(taskRef(userId, task.id));
  });

  await batch.commit();
};

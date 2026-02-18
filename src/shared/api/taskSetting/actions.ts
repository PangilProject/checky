/**
 * @file taskSetting/actions.ts
 * @description API 모듈
 */

import { doc, serverTimestamp, writeBatch } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import type { Task } from "@/shared/api/task";
import { taskRef, tasksRef } from "./refs";
import { fetchTasksAndCompleted, getUncompletedTasks } from "./helpers";
import { getTasksByDateOnce } from "./queries";
import type { DateOnlyParams, MoveTasksParams } from "./types";

/**
 * @description 태스크들의 날짜를 일괄 변경합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
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

/**
 * @description 미완료 태스크를 오늘 날짜로 이동합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
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

/**
 * @description 미완료 태스크를 지정 날짜로 이동합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
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

/**
 * @description 미완료 태스크를 삭제합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
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

/**
 * @description 모든 태스크를 다른 날짜로 복사합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
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
      orderIndex: index,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

/**
 * @description 해당 날짜의 모든 태스크를 삭제합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
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

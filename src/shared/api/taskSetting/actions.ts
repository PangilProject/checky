import { doc, serverTimestamp, writeBatch } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import type { Task } from "@/shared/api/task";
import { patchMonthlyStatsByDayDeltas } from "@/shared/api/monthlyStats";
import { taskRef, tasksRef } from "./refs";
import { fetchTasksAndCompleted, getUncompletedTasks } from "./helpers";
import { getTasksByDateOnce } from "./queries";
import type { DateOnlyParams, MoveTasksParams } from "./types";

/**
 * 태스크들의 날짜를 일괄 변경합니다.
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

const patchDayStats = async ({
  userId,
  date,
  totalDelta,
  completedDelta,
  remainingDelta,
}: {
  userId: string;
  date: string;
  totalDelta: number;
  completedDelta: number;
  remainingDelta: number;
}) => {
  await patchMonthlyStatsByDayDeltas({
    userId,
    month: date.slice(0, 7),
    day: date.slice(8, 10),
    totalDelta,
    completedDelta,
    remainingDelta,
  });
};

/**
 * 끝내지 못한 할 일을 오늘로 가져온다.
 *
 * 완료한 것은 그대로 두고 남은 것만 옮긴다.
 * 옮기면 두 날짜의 집계가 함께 바뀌므로 월간 요약도 이어서 조정한다.
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

  const movedCount = targets.length;
  if (movedCount === 0 || fromDate === toDate) return;

  await Promise.all([
    patchDayStats({
      userId,
      date: fromDate,
      totalDelta: -movedCount,
      completedDelta: 0,
      remainingDelta: -movedCount,
    }),
    patchDayStats({
      userId,
      date: toDate,
      totalDelta: movedCount,
      completedDelta: 0,
      remainingDelta: movedCount,
    }),
  ]);
};

/**
 * 끝내지 못한 할 일을 고른 날짜로 옮긴다.
 *
 * 옮기면 두 날짜의 집계가 함께 바뀌므로 월간 요약도 이어서 조정한다.
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

  const movedCount = targets.length;
  if (movedCount === 0 || fromDate === toDate) return;

  await Promise.all([
    patchDayStats({
      userId,
      date: fromDate,
      totalDelta: -movedCount,
      completedDelta: 0,
      remainingDelta: -movedCount,
    }),
    patchDayStats({
      userId,
      date: toDate,
      totalDelta: movedCount,
      completedDelta: 0,
      remainingDelta: movedCount,
    }),
  ]);
};

/**
 * 끝내지 못한 할 일을 지운다.
 *
 * 한 배치로 지운 뒤 그날의 월간 요약에서 지운 만큼 뺀다.
 * 지울 것이 없으면 요약을 건드리지 않는다.
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

  const removedCount = targets.length;
  if (!removedCount) return;

  await patchDayStats({
    userId,
    date,
    totalDelta: -removedCount,
    completedDelta: 0,
    remainingDelta: -removedCount,
  });
};

/**
 * 하루치 할 일을 다른 날짜로 복사한다.
 *
 * 원본은 그대로 두고 같은 내용을 새 문서로 만든다. 완료 기록은 따라가지 않는다.
 * 복사한 만큼 대상 날짜의 월간 요약을 늘린다.
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

  const copiedCount = tasks.length;
  if (!copiedCount) return;

  await patchDayStats({
    userId,
    date: toDate,
    totalDelta: copiedCount,
    completedDelta: 0,
    remainingDelta: copiedCount,
  });
};

/**
 * 하루치 할 일을 모두 지운다.
 *
 * 완료 여부와 상관없이 그날 할 일 문서를 한 배치로 지우고 월간 요약을 되돌린다.
 * 완료 기록(taskLogs)은 이 배치에 포함되지 않는다.
 */
export const deleteAllTasksByDate = async ({
  userId,
  date,
}: DateOnlyParams) => {
  const { tasks, completedTaskIds } = await fetchTasksAndCompleted({
    userId,
    date,
  });

  const batch = writeBatch(db);

  tasks.forEach((task) => {
    batch.delete(taskRef(userId, task.id));
  });

  await batch.commit();

  if (!tasks.length) return;

  const completedCount = tasks.filter((task) =>
    completedTaskIds.has(task.id)
  ).length;
  const uncompletedCount = tasks.length - completedCount;

  await patchDayStats({
    userId,
    date,
    totalDelta: -tasks.length,
    completedDelta: -completedCount,
    remainingDelta: -uncompletedCount,
  });
};

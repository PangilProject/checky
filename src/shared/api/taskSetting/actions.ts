import { doc, serverTimestamp, writeBatch } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { getTasksByDateOnce, type Task } from "@/shared/api/task";
import { patchMonthlyStatsByDayDeltas } from "@/shared/api/monthlyStats";
import { taskRef, tasksRef } from "@/shared/api/task/refs";
import { taskLogsRef } from "@/shared/api/taskLog/refs";
import { fetchTasksAndCompleted, getUncompletedTasks } from "./helpers";
import type { DateOnlyParams, MoveTasksParams } from "./types";

/**
 * 대상 날짜에서 이어 쓸 순서 값을 나눠 주는 함수를 만든다.
 *
 * 순서 값은 날짜와 분류 안에서만 뜻이 있다. 옮기거나 복사할 때 원래 값을 그대로 두거나
 * 0 부터 다시 매기면, 대상 날짜에 이미 그 번호를 쓰는 할 일이 있어 목록이 뒤섞인다.
 * 그래서 분류별로 현재 가장 큰 값을 찾아 그 뒤부터 하나씩 나눠 준다.
 *
 * 부를 때마다 값을 올리므로, 넘기는 순서가 곧 화면에 놓이는 순서가 된다.
 */
const createOrderIndexAllocator = (existingTasks: Task[]) => {
  const lastIndexByCategory = new Map<string, number>();

  existingTasks.forEach((task) => {
    if (typeof task.orderIndex !== "number") return;

    const current = lastIndexByCategory.get(task.categoryId);
    if (current === undefined || task.orderIndex > current) {
      lastIndexByCategory.set(task.categoryId, task.orderIndex);
    }
  });

  return (categoryId: string) => {
    const next = (lastIndexByCategory.get(categoryId) ?? -1) + 1;
    lastIndexByCategory.set(categoryId, next);
    return next;
  };
};

/**
 * 원래 목록 순서를 유지한 채 넘기기 위해 순서 값으로 정렬한다.
 *
 * 날짜로만 걸러 읽은 결과는 순서가 정해져 있지 않다. 그대로 새 번호를 매기면
 * 옮긴 것들끼리의 앞뒤가 뒤바뀐다.
 */
const sortByOrderIndex = (tasks: Task[]) =>
  [...tasks].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

/**
 * 태스크들의 날짜를 일괄 변경합니다.
 *
 * 대상 날짜의 기존 할 일을 먼저 읽어, 그 뒤에 이어지도록 순서 값을 새로 매긴다.
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
  const existingTasks = await getTasksByDateOnce({ userId, date: toDate });
  const allocateOrderIndex = createOrderIndexAllocator(existingTasks);

  const batch = writeBatch(db);

  sortByOrderIndex(tasks).forEach((task) => {
    batch.update(taskRef(userId, task.id), {
      date: toDate,
      orderIndex: allocateOrderIndex(task.categoryId),
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

  // 같은 날짜로 옮기는 것은 아무 뜻이 없다. 쓰기도 하지 않는다.
  // 순서 값을 다시 매기는 쪽이 원본과 대상을 같은 날짜로 보게 되어 값만 밀린다.
  if (targets.length === 0 || fromDate === toDate) return 0;

  await updateTasksDate({ userId, tasks: targets, toDate });

  const movedCount = targets.length;

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

  return movedCount;
};

/**
 * 끝내지 못한 할 일을 그 완료 기록과 함께 지운다.
 *
 * 한 배치로 지운 뒤 그날의 월간 요약에서 지운 만큼 뺀다.
 * 지울 것이 없으면 요약을 건드리지 않는다.
 */
export const deleteUncompletedTasks = async ({
  userId,
  date,
}: DateOnlyParams) => {
  const { tasks, completedTaskIds, taskLogs } = await fetchTasksAndCompleted({
    userId,
    date,
  });

  const targets = getUncompletedTasks(tasks, completedTaskIds);

  // 지울 것이 없으면 빈 배치 커밋도 하지 않는다. 빈 커밋도 네트워크 왕복이다.
  const removedCount = targets.length;
  if (!removedCount) return 0;

  const batch = writeBatch(db);

  targets.forEach((task) => {
    batch.delete(taskRef(userId, task.id));
  });

  // 지운 할 일에 딸린 기록(미완료 체크 흔적)도 함께 지운다.
  // 남겨 두면 화면에는 안 보여도 이후 모든 재계산이 영원히 읽는다.
  const targetIds = new Set(targets.map((task) => task.id));
  taskLogs
    .filter((log) => targetIds.has(log.taskId))
    .forEach((log) => {
      batch.delete(doc(taskLogsRef(userId), log.id));
    });

  await batch.commit();

  await patchDayStats({
    userId,
    date,
    totalDelta: -removedCount,
    completedDelta: 0,
    remainingDelta: -removedCount,
  });

  return removedCount;
};

/**
 * 하루치 할 일을 다른 날짜로 복사한다.
 *
 * 원본은 그대로 두고 같은 내용을 새 문서로 만든다. 완료 기록은 따라가지 않는다.
 * 대상 날짜의 기존 할 일 뒤에 이어지도록 순서 값을 새로 매긴다.
 * 복사한 만큼 대상 날짜의 월간 요약을 늘린다.
 */
export const copyAllTasksToDate = async ({
  userId,
  fromDate,
  toDate,
}: MoveTasksParams) => {
  const [tasks, existingTasks] = await Promise.all([
    getTasksByDateOnce({ userId, date: fromDate }),
    getTasksByDateOnce({ userId, date: toDate }),
  ]);

  // 복사할 것이 없으면 빈 배치 커밋도 하지 않는다. 빈 커밋도 네트워크 왕복이다.
  if (!tasks.length) return 0;

  const allocateOrderIndex = createOrderIndexAllocator(existingTasks);
  const batch = writeBatch(db);

  sortByOrderIndex(tasks).forEach((task) => {
    const nextRef = doc(tasksRef(userId));

    batch.set(nextRef, {
      title: task.title,
      categoryId: task.categoryId,
      categoryColor: task.categoryColor,
      date: toDate,
      ...(task.time && { time: task.time }),
      orderIndex: allocateOrderIndex(task.categoryId),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();

  const copiedCount = tasks.length;

  await patchDayStats({
    userId,
    date: toDate,
    totalDelta: copiedCount,
    completedDelta: 0,
    remainingDelta: copiedCount,
  });

  return copiedCount;
};

/**
 * 하루치 할 일을 완료 기록과 함께 모두 지운다.
 *
 * 완료 여부와 상관없이 그날 할 일 문서를 한 배치로 지우고 월간 요약을 되돌린다.
 * 그날의 기록은 전부 함께 지운다. 할 일이 다 지워지므로 남는 기록은 모두 고아이고,
 * 이전에 고아가 된 기록이 있었다면 이 기회에 같이 정리된다.
 */
export const deleteAllTasksByDate = async ({
  userId,
  date,
}: DateOnlyParams) => {
  const { tasks, completedTaskIds, taskLogs } = await fetchTasksAndCompleted({
    userId,
    date,
  });

  // 지울 것이 없으면 빈 배치 커밋도 하지 않는다. 빈 커밋도 네트워크 왕복이다.
  if (!tasks.length && !taskLogs.length) return 0;

  const batch = writeBatch(db);

  tasks.forEach((task) => {
    batch.delete(taskRef(userId, task.id));
  });

  taskLogs.forEach((log) => {
    batch.delete(doc(taskLogsRef(userId), log.id));
  });

  await batch.commit();

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

  return tasks.length;
};

/**
 * @file task/crud.ts
 * @description API 모듈
 */

import {
  addDoc,
  deleteDoc,
  deleteField,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { taskLogsRef, taskRef, tasksRef } from "./refs";
import type { Task } from "./types";

/**
 * @description 태스크를 생성합니다.
 * @param params 요청 파라미터
 * @returns 생성 결과
 */
export const createTask = async ({
  userId,
  title,
  categoryId,
  categoryColor,
  date,
  time,
}: {
  userId: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
  time?: string;
}) => {
  const baseRef = tasksRef(userId);

  const q = query(
    baseRef,
    where("date", "==", date),
    where("categoryId", "==", categoryId),
    orderBy("orderIndex", "desc")
  );

  const snap = await getDocs(q);
  const orderIndex = snap.empty ? 0 : (snap.docs[0].data().orderIndex ?? 0) + 1;

  const docRef = await addDoc(baseRef, {
    title,
    categoryId,
    categoryColor,
    date,
    ...(time !== undefined && { time }),
    orderIndex,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    title,
    categoryId,
    categoryColor,
    date,
    ...(time !== undefined && { time }),
    orderIndex,
  } as Task;
};

/**
 * @description 태스크 수정과 날짜 이동을 처리합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const updateTaskWithDateMove = async ({
  userId,
  taskId,
  prevDate,
  nextDate,
  prevCategoryId,
  title,
  categoryId,
  categoryColor,
  time,
}: {
  userId: string;
  taskId: string;
  prevDate: string;
  nextDate: string;
  prevCategoryId?: string;
  title?: string;
  categoryId: string;
  categoryColor?: string;
  time?: string;
}) => {
  let nextOrderIndex: number | undefined;

  if (prevDate !== nextDate || (prevCategoryId && prevCategoryId !== categoryId)) {
    const q = query(
      tasksRef(userId),
      where("date", "==", nextDate),
      where("categoryId", "==", categoryId),
      orderBy("orderIndex", "desc")
    );

    const snap = await getDocs(q);
    nextOrderIndex = snap.empty ? 0 : (snap.docs[0].data().orderIndex ?? 0) + 1;
  }

  await updateDoc(taskRef(userId, taskId), {
    ...(title !== undefined && { title }),
    ...(time !== undefined ? { time } : { time: deleteField() }),
    date: nextDate,
    ...(categoryId && { categoryId }),
    ...(categoryColor && { categoryColor }),
    ...(nextOrderIndex !== undefined && { orderIndex: nextOrderIndex }),
    updatedAt: serverTimestamp(),
  });
  const prevLogQuery = query(
    taskLogsRef(userId),
    where("taskId", "==", taskId),
    where("date", "==", prevDate)
  );

  const snapshot = await getDocs(prevLogQuery);

  if (snapshot.empty) return;

  const prevLog = snapshot.docs[0];
  const prevLogData = prevLog.data();

  await deleteDoc(prevLog.ref);

  await addDoc(taskLogsRef(userId), {
    ...prevLogData,
    date: nextDate,
    updatedAt: serverTimestamp(),
  });
};

/**
 * @description 태스크와 관련 로그를 삭제합니다.
 * @param params 요청 파라미터
 * @returns 작업 결과
 */
export const deleteTaskWithLogs = async ({
  userId,
  taskId,
}: {
  userId: string;
  taskId: string;
}) => {
  const batch = writeBatch(db);

  batch.delete(taskRef(userId, taskId));

  const q = query(taskLogsRef(userId), where("taskId", "==", taskId));
  const snapshot = await getDocs(q);
  const wasCompleted = snapshot.docs.some(
    (docSnap) => docSnap.data().completed === true
  );

  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();

  return { wasCompleted };
};

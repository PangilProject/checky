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
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { taskLogsRef, taskRef, tasksRef } from "./refs";
import type { Task } from "./types";

/* =========================
   CREATE
========================= */
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

/* =========================
   UPDATE 
========================= */
export const updateTaskWithDateMove = async ({
  userId,
  taskId,
  prevDate,
  nextDate,
  title,
  categoryId,
  time,
}: {
  userId: string;
  taskId: string;
  prevDate: string;
  nextDate: string;
  title?: string;
  categoryId: string;
  time?: string;
}) => {
  // ✅ 날짜가 바뀐 경우: 새 날짜의 마지막 orderIndex 계산
  let nextOrderIndex: number | undefined;

  if (prevDate !== nextDate) {
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
    ...(nextOrderIndex !== undefined && { orderIndex: nextOrderIndex }),
    updatedAt: serverTimestamp(),
  });
  // 2️⃣ 기존 TaskLog 조회
  const prevLogQuery = query(
    taskLogsRef(userId),
    where("taskId", "==", taskId),
    where("date", "==", prevDate)
  );

  const snapshot = await getDocs(prevLogQuery);

  if (snapshot.empty) return;

  // 3️⃣ TaskLog 이동
  const prevLog = snapshot.docs[0];
  const prevLogData = prevLog.data();

  // 기존 로그 삭제
  await deleteDoc(prevLog.ref);

  // 새 날짜로 로그 생성
  await addDoc(taskLogsRef(userId), {
    ...prevLogData,
    date: nextDate,
    updatedAt: serverTimestamp(),
  });
};

/* =========================
   DELETE
========================= */
export const deleteTaskWithLogs = async ({
  userId,
  taskId,
}: {
  userId: string;
  taskId: string;
}) => {
  const batch = writeBatch(db);

  // 1️⃣ task 삭제
  batch.delete(taskRef(userId, taskId));

  // 2️⃣ 관련 taskLogs 조회
  const q = query(taskLogsRef(userId), where("taskId", "==", taskId));
  const snapshot = await getDocs(q);

  // 3️⃣ taskLogs 전부 삭제
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 4️⃣ 커밋
  await batch.commit();
};

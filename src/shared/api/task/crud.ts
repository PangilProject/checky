import {
  addDoc,
  deleteField,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { taskRef, tasksRef } from "./refs";
import { taskLogsRef } from "@/shared/api/taskLog/refs";
import type { Task } from "./types";

/**
 * 할 일을 만들어 그날 그 분류의 맨 뒤에 붙인다.
 *
 * 붙일 자리를 정하려고 같은 날짜·분류의 마지막 orderIndex 를 먼저 읽는다.
 * 읽기 1회 + 쓰기 1회이며, tasks(categoryId, date, orderIndex DESC) 복합 인덱스가 필요하다.
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

  // 가장 큰 순서 값 하나만 읽는다. limit 이 없으면 그날 그 분류 전체를 읽어
  // 문서 수만큼 과금되고도 첫 문서만 쓴다.
  const q = query(
    baseRef,
    where("date", "==", date),
    where("categoryId", "==", categoryId),
    orderBy("orderIndex", "desc"),
    limit(1)
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
    // 저장에는 서버 시각을 쓰지만 그 값을 알려면 문서를 다시 읽어야 한다.
    // 화면은 등록 후 며칠 지났는지를 날짜 단위로만 쓰므로 여기서는 기기 시각으로 채운다.
    // 비워 두면 다시 읽어 오기 전까지 경과일 표시가 뜨지 않는다.
    createdAt: new Date(),
  } as Task;
};

/**
 * 할 일을 고치고, 날짜나 분류가 바뀌면 옮긴다.
 *
 * 날짜나 분류가 바뀐 경우에만 옮겨 갈 자리의 orderIndex 를 새로 읽는다.
 * 완료 기록도 새 날짜로 따라가며, 지우고 새로 만드는 두 동작을 한 배치로 묶어
 * 중간에 실패해도 기록이 사라지지 않게 한다.
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
      orderBy("orderIndex", "desc"),
      limit(1)
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
  // 날짜가 그대로면 완료 기록도 그 자리에 맞으므로 읽지도 옮기지도 않는다.
  if (prevDate === nextDate) return;

  const prevLogQuery = query(
    taskLogsRef(userId),
    where("taskId", "==", taskId),
    where("date", "==", prevDate)
  );

  const snapshot = await getDocs(prevLogQuery);

  if (snapshot.empty) return;

  const prevLogData = snapshot.docs[0].data();

  // 삭제와 생성을 하나의 배치로 처리해 중간에 실패해도 완료 기록이 사라지지 않게 한다.
  // 새 기록은 toggleTaskLog 와 같은 고정 ID(`{taskId}_{date}`)로 만든다.
  // 자동 ID 로 만들면 이후 토글이 고정 ID 문서를 또 만들어 기록이 두 벌이 된다.
  // 같은 이유로, 혹시 중복돼 있던 옛 기록도 전부 지워 하나로 모은다.
  const batch = writeBatch(db);
  snapshot.docs.forEach((logDoc) => batch.delete(logDoc.ref));
  batch.set(
    doc(taskLogsRef(userId), `${taskId}_${nextDate}`),
    {
      ...prevLogData,
      date: nextDate,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
};

/**
 * 할 일과 그 완료 기록을 함께 지운다.
 *
 * 배치 하나로 처리해 할 일만 지워지고 기록이 남는 상태를 만들지 않는다.
 * 반환하는 wasCompleted 는 호출부가 월간 통계를 되돌릴지 판단하는 데 쓴다.
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

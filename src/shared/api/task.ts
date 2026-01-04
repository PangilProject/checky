import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

/* =========================
   Task 타입
========================= */
export interface Task {
  id: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
  orderIndex: number;
}

/* =========================
   CREATE
========================= */
export const createTask = async ({
  userId,
  title,
  categoryId,
  categoryColor,
  date,
}: {
  userId: string;
  title: string;
  categoryId: string;
  categoryColor: string;
  date: string;
}) => {
  const tasksRef = collection(db, "users", userId, "tasks");

  const q = query(
    tasksRef,
    where("date", "==", date),
    where("categoryId", "==", categoryId),
    orderBy("orderIndex", "desc")
  );

  const snap = await getDocs(q);
  const orderIndex = snap.empty ? 0 : (snap.docs[0].data().orderIndex ?? 0) + 1;

  const docRef = await addDoc(tasksRef, {
    title,
    categoryId,
    categoryColor,
    date,
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
    orderIndex,
  } as Task;
};
/* =========================
   READ (date 기준)
========================= */
export const getTasksByDate = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: string;
  onChange: (tasks: Task[]) => void;
}) => {
  const tasksRef = collection(db, "users", userId, "tasks");

  const q = query(
    tasksRef,
    where("date", "==", date),
    orderBy("orderIndex", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, "id">),
    }));

    onChange(tasks);
  });
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
}: {
  userId: string;
  taskId: string;
  prevDate: string;
  nextDate: string;
  title?: string;
  categoryId: string;
}) => {
  const taskRef = doc(db, "users", userId, "tasks", taskId);

  // ✅ 날짜가 바뀐 경우: 새 날짜의 마지막 orderIndex 계산
  let nextOrderIndex: number | undefined;

  if (prevDate !== nextDate) {
    const q = query(
      collection(db, "users", userId, "tasks"),
      where("date", "==", nextDate),
      where("categoryId", "==", categoryId),
      orderBy("orderIndex", "desc")
    );

    const snap = await getDocs(q);
    nextOrderIndex = snap.empty ? 0 : (snap.docs[0].data().orderIndex ?? 0) + 1;
  }

  await updateDoc(taskRef, {
    ...(title !== undefined && { title }),
    date: nextDate,
    ...(nextOrderIndex !== undefined && { orderIndex: nextOrderIndex }),
    updatedAt: serverTimestamp(),
  });

  // 2️⃣ 기존 TaskLog 조회
  const prevLogQuery = query(
    collection(db, "users", userId, "taskLogs"),
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
  await addDoc(collection(db, "users", userId, "taskLogs"), {
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
  const taskRef = doc(db, "users", userId, "tasks", taskId);
  batch.delete(taskRef);

  // 2️⃣ 관련 taskLogs 조회
  const logsRef = collection(db, "users", userId, "taskLogs");
  const q = query(logsRef, where("taskId", "==", taskId));
  const snapshot = await getDocs(q);

  // 3️⃣ taskLogs 전부 삭제
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 4️⃣ 커밋
  await batch.commit();
};

// 태스크 정렬
export const updateTaskOrder = async ({
  userId,
  tasks,
}: {
  userId: string;
  tasks: { id: string; orderIndex: number }[];
}) => {
  const batch = writeBatch(db);

  tasks.forEach(({ id, orderIndex }) => {
    batch.update(doc(db, "users", userId, "tasks", id), {
      orderIndex,
    });
  });

  await batch.commit();
};

// 마이그레이션
export const migrateTaskOrderIndex = async (userId: string) => {
  const baseRef = collection(db, "users", userId, "tasks");
  const snap = await getDocs(query(baseRef, orderBy("createdAt", "asc")));

  const batch = writeBatch(db);
  let needCommit = false;

  const groupMap = new Map<string, any[]>();

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const key = `${data.date}_${data.categoryId}`;

    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push({ ref: docSnap.ref, data });
  });

  groupMap.forEach((tasks) => {
    tasks.forEach((item, index) => {
      if (typeof item.data.orderIndex === "number") return;

      needCommit = true;
      batch.update(item.ref, {
        orderIndex: index,
        updatedAt: serverTimestamp(),
      });
    });
  });

  if (needCommit) {
    await batch.commit();
    console.log("[Task] orderIndex migration done");
  }
};

// 월 별 모든 내용
export const getTasksByMonth = ({
  userId,
  date,
  onChange,
}: {
  userId: string;
  date: Date;
  onChange: (tasks: Task[]) => void;
}) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;

  const q = query(
    collection(db, "users", userId, "tasks"),
    where("date", ">=", start),
    where("date", "<=", end),
    orderBy("date", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, "id">),
    }));

    onChange(tasks);
  });
};

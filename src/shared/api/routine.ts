import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Category } from "./category";
import { formatDateKST } from "../hooks/formatDate";

export interface Routine {
  id: string;
  title: string;
  categoryId: string;
  days: number[];
  orderIndex: number;
  startDate: string;
  createdAt?: Date;
}
export interface RoutineCategory {
  category: Category;
  routines: Routine[];
}

// 루틴 불러오기
export const getRoutinesByCategory = async ({
  userId,
  categoryId,
}: {
  userId: string;
  categoryId: string;
}): Promise<Routine[]> => {
  const routinesRef = collection(db, "users", userId, "routines");

  const q = query(
    routinesRef,
    where("categoryId", "==", categoryId),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Routine, "id">),
  }));
};

export const createRoutine = async ({
  userId,
  title,
  categoryId,
  days,
  startDate,
}: {
  userId: string;
  title: string;
  categoryId: string;
  days: number[];
  startDate: string;
}) => {
  const routinesRef = collection(db, "users", userId, "routines");

  const snap = await getDocs(
    query(routinesRef, where("categoryId", "==", categoryId))
  );

  await addDoc(routinesRef, {
    title,
    categoryId,
    days,
    startDate,
    orderIndex: snap.size,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
  });
};

// 실시간 업데이트
export const subscribeRoutinesByCategory = ({
  userId,
  categoryId,
  onChange,
}: {
  userId: string;
  categoryId: string;
  onChange: (routines: Routine[]) => void;
}) => {
  const routinesRef = collection(db, "users", userId, "routines");

  const q = query(
    routinesRef,
    where("categoryId", "==", categoryId),
    orderBy("orderIndex", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Routine, "id">),
    }));

    onChange(routines);
  });
};

// 루틴 수정

export const updateRoutine = async ({
  userId,
  routineId,
  title,
  days,
  startDate,
}: {
  userId: string;
  routineId: string;
  title: string;
  days: number[];
  startDate: string;
}) => {
  const routineRef = doc(db, "users", userId, "routines", routineId);

  await updateDoc(routineRef, {
    title,
    days,
    startDate, // ✅ 추가
    updatedAt: serverTimestamp(),
  });
};
// RoutineReport.types.ts

export interface RoutineReportWeek {
  startDate: string; // "2026-01-05"
  endDate: string; // "2026-01-11"
  days: {
    date: string; // "2026-01-05"
    day: number; // 1 (월)
    label: string; // "월"
  }[];
}

export interface RoutineReportRow {
  routineId: string;
  routineTitle: string;

  category: {
    id: string;
    name: string;
    color: string; // ✅ UI 핵심
  };

  startDate: string; // 루틴 시작일
  repeatDays: number[]; // [1, 4] (월, 목)

  checks: Record<string, boolean>; // date -> done
}

// 주 별 루틴 목록 가져오기
export interface RoutineReport {
  week: RoutineReportWeek;
  rows: RoutineReportRow[];
}

export const getRoutineReportByWeek = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<RoutineReport> => {
  const days = [];
  const start = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    days.push({
      date: formatDateKST(d),
      day: d.getDay(),
      label: ["일", "월", "화", "수", "목", "금", "토"][d.getDay()],
    });
  }

  const week = {
    startDate,
    endDate,
    days,
  };
  // 1️⃣ 루틴 가져오기
  const routinesSnap = await getDocs(
    query(
      collection(db, "users", userId, "routines"),
      where("startDate", "<=", week.endDate)
    )
  );

  const routines = routinesSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));

  // 2️⃣ routineLogs 가져오기
  const logsSnap = await getDocs(
    query(
      collection(db, "users", userId, "routineLogs"),
      where("date", ">=", week.startDate),
      where("date", "<=", week.endDate)
    )
  );

  const logs = logsSnap.docs.map((doc) => doc.data());

  // 3️⃣ 로그를 Map으로 변환
  const logMap = new Map<string, boolean>();
  logs.forEach((log) => {
    logMap.set(`${log.routineId}_${log.date}`, log.done);
  });

  const categoriesSnap = await getDocs(
    collection(db, "users", userId, "categories")
  );

  const categoriesMap = Object.fromEntries(
    categoriesSnap.docs.map((doc) => [
      doc.id,
      { id: doc.id, ...(doc.data() as any) },
    ])
  );

  // 4️⃣ RoutineReportRow 생성 + 정렬
  const rows = routines
    .map((routine) => {
      const checks: Record<string, boolean> = {};

      week.days.forEach((day) => {
        const isRepeatDay = routine.days.includes(day.day);
        const isAfterStart = day.date >= routine.startDate;

        if (isRepeatDay && isAfterStart) {
          checks[day.date] = logMap.get(`${routine.id}_${day.date}`) ?? false;
        }
      });

      return {
        routineId: routine.id,
        routineTitle: routine.title,
        routineOrderIndex: routine.orderIndex,
        category: categoriesMap[routine.categoryId],
        startDate: routine.startDate,
        repeatDays: routine.days,
        checks,
      };
    })
    .sort((a, b) => {
      // 1️⃣ 카테고리 순서
      if (a.category.orderIndex !== b.category.orderIndex) {
        return a.category.orderIndex - b.category.orderIndex;
      }

      // 2️⃣ 같은 카테고리면 루틴 순서
      return a.routineOrderIndex - b.routineOrderIndex;
    });

  return {
    week,
    rows,
  };
};

// 루틴 삭제

export const deleteRoutine = async ({
  userId,
  routineId,
}: {
  userId: string;
  routineId: string;
}) => {
  const routineRef = doc(db, "users", userId, "routines", routineId);
  await deleteDoc(routineRef);
};

// 루틴 순서 변경
export const updateRoutineOrder = async ({
  userId,
  routines,
}: {
  userId: string;
  routines: { id: string; orderIndex: number }[];
}) => {
  const batch = writeBatch(db);

  routines.forEach(({ id, orderIndex }) => {
    batch.update(doc(db, "users", userId, "routines", id), {
      orderIndex,
    });
  });

  await batch.commit();
};

// 마이그레이션
export const migrateRoutineOrderIndex = async (userId: string) => {
  const baseRef = collection(db, "users", userId, "routines");

  // 🔹 기존 루틴 전체를 createdAt 기준으로 가져오기
  const snap = await getDocs(query(baseRef, orderBy("createdAt", "asc")));

  const batch = writeBatch(db);
  let needCommit = false;

  snap.docs.forEach((docSnap, index) => {
    const data = docSnap.data();

    // ✅ 이미 orderIndex 있으면 스킵
    if (typeof data.orderIndex === "number") return;

    needCommit = true;

    batch.update(docSnap.ref, {
      orderIndex: index,
      updatedAt: serverTimestamp(),
    });
  });

  if (needCommit) {
    await batch.commit();
    console.log("[Routine] orderIndex migration done");
  }
};

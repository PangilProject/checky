import {
  getDocs,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { mapDoc } from "@/shared/api/_common/mappers";
import { formatDateKST } from "@/shared/hooks/formatDate";
import { categoriesRef, routineLogsRef, routinesRef } from "./refs";
import type {
  Routine,
  RoutineReport,
  RoutineReportRow,
  RoutineReportWeek,
} from "./types";

type RoutineReportRowInternal = RoutineReportRow & {
  routineOrderIndex: number;
  categoryOrderIndex: number;
};

type RoutineLog = {
  routineId: string;
  date: string;
  done: boolean;
};

type CategoryMapValue = {
  id: string;
  name: string;
  color: string;
  orderIndex: number;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const buildWeek = (startDate: string, endDate: string): RoutineReportWeek => {
  const days: RoutineReportWeek["days"] = [];
  const start = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    days.push({
      date: formatDateKST(d),
      day: d.getDay(),
      label: DAY_LABELS[d.getDay()],
    });
  }

  return {
    startDate,
    endDate,
    days,
  };
};

const buildLogMap = (logs: RoutineLog[]) => {
  const logMap = new Map<string, boolean>();
  logs.forEach((log) => {
    logMap.set(`${log.routineId}_${log.date}`, log.done);
  });
  return logMap;
};

const buildCategoriesMap = (
  docs: QueryDocumentSnapshot<DocumentData>[]
) => {
  return Object.fromEntries(
    docs.map((doc) => [
      doc.id,
      { id: doc.id, ...(doc.data() as Omit<CategoryMapValue, "id">) },
    ])
  ) as Record<string, CategoryMapValue>;
};

const buildRows = ({
  routines,
  categoriesMap,
  week,
  logMap,
}: {
  routines: Routine[];
  categoriesMap: Record<string, CategoryMapValue>;
  week: RoutineReportWeek;
  logMap: Map<string, boolean>;
}): RoutineReportRow[] => {
  const rowsInternal: RoutineReportRowInternal[] = routines
    .map((routine) => {
      const checks: Record<string, boolean> = {};

      week.days.forEach((day) => {
        const isRepeatDay = routine.days.includes(day.day);
        const isAfterStart = day.date >= routine.startDate;

        if (isRepeatDay && isAfterStart) {
          checks[day.date] = logMap.get(`${routine.id}_${day.date}`) ?? false;
        }
      });

      const categoryData = categoriesMap[routine.categoryId];
      if (!categoryData) return null;

      const { orderIndex: categoryOrderIndex, ...category } = categoryData;

      return {
        routineId: routine.id,
        routineTitle: routine.title,
        routineOrderIndex: routine.orderIndex,
        categoryOrderIndex,
        category,
        startDate: routine.startDate,
        repeatDays: routine.days,
        checks,
      };
    })
    .filter((row): row is RoutineReportRowInternal => row !== null)
    .sort((a, b) => {
      if (a.categoryOrderIndex !== b.categoryOrderIndex) {
        return a.categoryOrderIndex - b.categoryOrderIndex;
      }

      return a.routineOrderIndex - b.routineOrderIndex;
    });

  return rowsInternal.map((row) => ({
    routineId: row.routineId,
    routineTitle: row.routineTitle,
    category: row.category,
    startDate: row.startDate,
    repeatDays: row.repeatDays,
    checks: row.checks,
  }));
};

// 주 별 루틴 목록 가져오기
export const getRoutineReportByWeek = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<RoutineReport> => {
  const week = buildWeek(startDate, endDate);

  // 1️⃣ 루틴 가져오기
  const routinesSnap = await getDocs(
    query(routinesRef(userId), where("startDate", "<=", week.endDate))
  );

  const routines = routinesSnap.docs.map((doc) => mapDoc<Routine>(doc));

  // 2️⃣ routineLogs 가져오기
  const logsSnap = await getDocs(
    query(
      routineLogsRef(userId),
      where("date", ">=", week.startDate),
      where("date", "<=", week.endDate)
    )
  );

  const logs = logsSnap.docs.map((doc) => doc.data() as RoutineLog);
  const logMap = buildLogMap(logs);

  // 3️⃣ categories 가져오기
  const categoriesSnap = await getDocs(categoriesRef(userId));
  const categoriesMap = buildCategoriesMap(categoriesSnap.docs);

  // 4️⃣ RoutineReportRow 생성 + 정렬
  const rows = buildRows({ routines, categoriesMap, week, logMap });

  return {
    week,
    rows,
  };
};

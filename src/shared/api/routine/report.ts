/**
 * @file routine/report.ts
 * @description API 모듈
 */

import {
  getDocs,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
  where,
} from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import { formatDateKST } from "@/shared/hooks/formatDate";
import { categoriesRef, routineLogsRef, routinesRef } from "./refs";
import type {
  Routine,
  RoutineReport,
  RoutineReportRow,
  RoutineReportWeek,
} from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";

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

/**
 * @description 주간 범위 데이터를 생성합니다.
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 반환값
 */
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

/**
 * @description 루틴 로그를 조회 맵으로 변환합니다.
 * @param logs 로그 목록
 * @returns 반환값
 */
const buildLogMap = (logs: RoutineLog[]) => {
  const logMap = new Map<string, boolean>();
  logs.forEach((log) => {
    logMap.set(`${log.routineId}_${log.date}`, log.done);
  });
  return logMap;
};

/**
 * @description 카테고리 스냅샷을 맵으로 변환합니다.
 * @param params 요청 파라미터
 * @returns 반환값
 */
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

/**
 * @description 리포트 행 데이터를 생성합니다.
 * @param params 요청 파라미터
 * @returns 반환값
 */
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
      if (routine.endDate && routine.endDate < week.startDate) {
        return null;
      }
      const checks: Record<string, boolean> = {};

      week.days.forEach((day) => {
        const isRepeatDay = routine.days.includes(day.day);
        const isAfterStart = day.date >= routine.startDate;
        const isBeforeEnd = !routine.endDate || day.date <= routine.endDate;

        if (isRepeatDay && isAfterStart && isBeforeEnd) {
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

/**
 * @description 주간 루틴 리포트를 조회합니다.
 * @param params 요청 파라미터
 * @returns 조회 결과
 */
export const getRoutineReportByWeek = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<RoutineReport> => {
  const perf = baselineFetch("routineReport/fetchByWeek", {
    userId,
    startDate,
    endDate,
  });
  const week = buildWeek(startDate, endDate);

  const routinesSnap = await getDocs(
    query(routinesRef(userId), where("startDate", "<=", week.endDate))
  );

  const routines = routinesSnap.docs.map((doc) => mapDoc<Routine>(doc));

  const logsSnap = await getDocs(
    query(
      routineLogsRef(userId),
      where("date", ">=", week.startDate),
      where("date", "<=", week.endDate)
    )
  );

  const logs = logsSnap.docs.map((doc) => doc.data() as RoutineLog);
  const logMap = buildLogMap(logs);

  const categoriesSnap = await getDocs(categoriesRef(userId));
  const categoriesMap = buildCategoriesMap(categoriesSnap.docs);

  const rows = buildRows({ routines, categoriesMap, week, logMap });

  perf.end({
    routineCount: routines.length,
    logCount: logs.length,
    categoryCount: categoriesSnap.docs.length,
    rowCount: rows.length,
  });

  return {
    week,
    rows,
  };
};

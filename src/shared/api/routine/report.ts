import {
  getDocs,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
  where,
} from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import { formatDateToYmd, parseYmd } from "@/shared/hooks/formatDate";
import { categoriesRef, routineLogsRef, routinesRef } from "./refs";
import type {
  Routine,
  RoutineReport,
  RoutineReportRow,
  RoutineReportWeek,
  RoutineScheduleHistoryItem,
} from "./types";
import { baselineFetch } from "@/shared/utils/perfBaseline";
import { getDayLabel } from "@/shared/constants/dateLabels";

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

type FirestoreTimestampLike = {
  toDate?: () => Date;
};

/**
 * 주간 범위 데이터를 생성합니다.
 *
 * 시작일은 반드시 parseYmd 로 읽는다. `new Date("2026-08-02")` 는 그 문자열을
 * UTC 자정으로 해석하므로, UTC 보다 늦은 지역에서는 전날이 되어 일곱 칸이 통째로 하루 밀린다.
 * 그러면 조회 범위와 칸의 날짜가 어긋나 기존 체크가 사라져 보이고
 * 새로 체크한 값도 다른 날짜에 저장된다.
 *
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 */
const buildWeek = (startDate: string, endDate: string): RoutineReportWeek => {
  const days: RoutineReportWeek["days"] = [];
  const start = parseYmd(startDate);

  // 날짜 형식이 어긋나면 빈 주를 돌려준다. 틀린 날짜로 일곱 칸을 그리는 것보다 낫다.
  if (!start) return { startDate, endDate, days };

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    days.push({
      date: formatDateToYmd(d),
      day: d.getDay(),
      label: getDayLabel(d.getDay()),
    });
  }

  return {
    startDate,
    endDate,
    days,
  };
};

/**
 * 루틴 로그를 조회 맵으로 변환합니다.
 * @param logs 로그 목록
 */
const buildLogMap = (logs: RoutineLog[]) => {
  const logMap = new Map<string, boolean>();
  logs.forEach((log) => {
    logMap.set(`${log.routineId}_${log.date}`, log.done);
  });
  return logMap;
};

/**
 * Firestore Timestamp/Date 값을 YYYY-MM-DD로 변환합니다.
 * @param value 날짜 원본 값
 */
const toDateString = (value: unknown): string | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return formatDateToYmd(value);
  }

  const maybeTimestamp = value as FirestoreTimestampLike;
  if (typeof maybeTimestamp.toDate === "function") {
    return formatDateToYmd(maybeTimestamp.toDate());
  }

  return null;
};

const normalizeScheduleHistory = (
  routine: Routine
): RoutineScheduleHistoryItem[] => {
  const history =
    routine.scheduleHistory && routine.scheduleHistory.length > 0
      ? routine.scheduleHistory
      : [];

  if (history.length > 0) {
    return [...history].sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );
  }

  return [{ effectiveFrom: routine.startDate, days: routine.days }];
};

const getRepeatDaysByDate = ({
  history,
  date,
}: {
  history: RoutineScheduleHistoryItem[];
  date: string;
}): number[] => {
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i];
    if (item.effectiveFrom <= date) {
      return item.days;
    }
  }

  return [];
};

/**
 * 카테고리 스냅샷을 맵으로 변환합니다.
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
 * 리포트 행 데이터를 생성합니다.
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
      const updatedAt = toDateString(routine.updatedAt);
      const scheduleHistory = normalizeScheduleHistory(routine);
      const hasExplicitHistory = Boolean(
        routine.scheduleHistory && routine.scheduleHistory.length > 0
      );

      week.days.forEach((day) => {
        const logKey = `${routine.id}_${day.date}`;
        const hasLog = logMap.has(logKey);
        const isAfterStart = day.date >= routine.startDate;
        const isBeforeEnd = !routine.endDate || day.date <= routine.endDate;
        const repeatDays = getRepeatDaysByDate({
          history: scheduleHistory,
          date: day.date,
        });
        const isRepeatDay = repeatDays.includes(day.day);
        const isAfterUpdatedAt = !updatedAt || day.date >= updatedAt;
        const isLegacyVisible = !hasExplicitHistory && hasLog;
        const isVisible =
          hasExplicitHistory || !updatedAt
            ? isRepeatDay
            : isLegacyVisible || (isAfterUpdatedAt && isRepeatDay);

        if (isVisible && isAfterStart && isBeforeEnd) {
          checks[day.date] = logMap.get(logKey) ?? false;
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
 * 한 주 동안의 루틴 수행 현황을 표 형태로 만든다.
 *
 * 루틴과 그 주의 기록을 읽어 요일별 체크 여부로 엮는다.
 * 반복 요일이 바뀐 루틴은 scheduleHistory 를 따라 그 시점의 요일을 적용한다.
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

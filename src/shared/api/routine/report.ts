import { getDocs, query, where } from "firebase/firestore/lite";
import { mapDoc } from "@/shared/api/_common/mappers";
import {
  formatDateLikeToYmd,
  formatDateToYmd,
  parseYmd,
} from "@/shared/hooks/formatDate";
import { routineLogsRef, routinesRef } from "./refs";
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
 * 카테고리 목록을 id 로 찾는 맵으로 변환합니다.
 */
const buildCategoriesMap = (categories: CategoryMapValue[]) => {
  return Object.fromEntries(
    categories.map((category) => [category.id, category])
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
      // 레거시 루틴 게이트의 기준일. 월간 재계산·legacy 집계도 같은 규칙을 쓴다.
      const updatedAt = formatDateLikeToYmd(routine.updatedAt);
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
 *
 * 카테고리는 여기서 읽지 않고 호출자가 넘긴다. 리포트는 주 단위로 캐시되어
 * 여기서 읽으면 주가 바뀔 때마다 카테고리 전체를 다시 과금하기 때문이다.
 * 호출자는 정본 카테고리 캐시(useCategoriesQuery)에서 조달한다.
 */
export const getRoutineReportByWeek = async ({
  userId,
  startDate,
  endDate,
  categories,
}: {
  userId: string;
  startDate: string;
  endDate: string;
  categories: CategoryMapValue[];
}): Promise<RoutineReport> => {
  const perf = baselineFetch("routineReport/fetchByWeek", {
    userId,
    startDate,
    endDate,
  });
  const week = buildWeek(startDate, endDate);

  // 두 조회는 서로 의존하지 않으므로 병렬로 보낸다. 직렬이면 왕복이 두 배다.
  // endDate 로 종료 루틴을 서버에서 거르지 못하는 이유: 끝나지 않는 루틴은
  // endDate 필드 자체가 없고, Firestore 는 없는 필드를 어떤 쿼리에도 매칭하지 않는다.
  // 그래서 startDate 조건만 걸고 종료 여부는 클라이언트에서 거른다.
  const [routinesSnap, logsSnap] = await Promise.all([
    getDocs(query(routinesRef(userId), where("startDate", "<=", week.endDate))),
    getDocs(
      query(
        routineLogsRef(userId),
        where("date", ">=", week.startDate),
        where("date", "<=", week.endDate)
      )
    ),
  ]);

  const routines = routinesSnap.docs.map((doc) => mapDoc<Routine>(doc));

  const logs = logsSnap.docs.map((doc) => doc.data() as RoutineLog);
  const logMap = buildLogMap(logs);

  const categoriesMap = buildCategoriesMap(categories);

  const rows = buildRows({ routines, categoriesMap, week, logMap });

  perf.end({
    routineCount: routines.length,
    logCount: logs.length,
    categoryCount: categories.length,
    rowCount: rows.length,
  });

  return {
    week,
    rows,
  };
};

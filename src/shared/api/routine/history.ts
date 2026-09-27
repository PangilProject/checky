import {
  buildMonthlyActivityCountMap,
  type MonthlyRoutine,
  type MonthlyRoutineLog,
} from "@/shared/api/monthlyStats/countMonth";
import { buildMonthKeysBetween } from "@/shared/api/monthlyStats/monthKeys";
import {
  formatDateLikeToYmd,
  formatDateToYmd,
  parseYmd,
} from "@/shared/utils/formatDate";
import { normalizeScheduleHistory } from "./schedule";
import type { Routine } from "./types";

/**
 * 루틴 하나의 기록을 날짜별로 펼치고 센다. 루틴 기록 창과 기록 화면이 쓴다.
 *
 * "그날 해야 했는가"는 달력 집계(buildMonthlyActivityCountMap)에 그 루틴 하나만 넣어 판단한다.
 * 반복 요일 이력과 레거시 게이트를 여기서 다시 구현하면, 달력은 해야 했던 날로 세는데
 * 기록 창은 쉬는 날로 그리는 식으로 둘이 어긋난다.
 */

/**
 * done: 했음 / missed: 해야 했는데 못 함 / off: 루틴 기간 안의 쉬는 날
 * upcoming: 기준일 뒤에 해야 할 날 / outside: 루틴 기간 밖이거나 기준일 뒤의 쉬는 날
 */
export type RoutineDayStatus = "done" | "missed" | "off" | "upcoming" | "outside";

export interface RoutineDay {
  date: string;
  /** getDay() 값. 0 이 일요일이다 */
  day: number;
  status: RoutineDayStatus;
}

export interface RoutineCount {
  /** 기준일까지 해야 했던 날 */
  total: number;
  /** 그중 한 날 */
  done: number;
}

/** 반복 요일 이력 한 구간. from ~ until 은 보여 주는 기간 안으로 잘라 둔 날짜다 */
export interface RoutineScheduleSegment extends RoutineCount {
  from: string;
  until: string;
  days: number[];
  isCurrent: boolean;
}

export interface RoutineHistorySummary extends RoutineCount {
  /** 해야 했던 날이 하루라도 있는 요일만, 일요일부터 담는다 */
  byWeekday: ({ day: number } & RoutineCount)[];
  /** 보여 주는 기간과 겹치는 이력 구간만, 오래된 것부터 담는다 */
  segments: RoutineScheduleSegment[];
}

type RoutineForHistory = Pick<
  Routine,
  "id" | "startDate" | "endDate" | "days" | "scheduleHistory" | "updatedAt"
>;

const shiftYmd = (ymd: string, diff: number) => {
  const date = parseYmd(ymd);
  if (!date) return ymd;
  date.setDate(date.getDate() + diff);
  return formatDateToYmd(date);
};

/**
 * startDate ~ endDate 의 날마다 상태를 매긴다. 날짜가 잘못되면 빈 배열이다.
 *
 * cutoffDate(보통 오늘) 뒤는 아직 오지 않은 날이라 했음·못 함으로 가르지 않는다.
 */
export const buildRoutineDays = ({
  routine,
  logs,
  startDate,
  endDate,
  cutoffDate,
}: {
  routine: RoutineForHistory;
  logs: MonthlyRoutineLog[];
  startDate: string;
  endDate: string;
  cutoffDate: string;
}): RoutineDay[] => {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  if (!start || !end || start > end) return [];

  const target: MonthlyRoutine = {
    id: routine.id,
    startDate: routine.startDate,
    endDate: routine.endDate,
    days: routine.days,
    scheduleHistory: routine.scheduleHistory,
    updatedAt: formatDateLikeToYmd(routine.updatedAt),
  };
  const ownLogs = logs.filter((log) => log.routineId === routine.id);

  const countByDate = new Map<string, { due: boolean; done: boolean }>();
  buildMonthKeysBetween(startDate, endDate).forEach((month) => {
    const [year, monthNumber] = month.split("-").map(Number);
    const counts = buildMonthlyActivityCountMap({
      date: new Date(year, monthNumber - 1, 1),
      tasks: [],
      taskLogs: [],
      routines: [target],
      routineLogs: ownLogs,
    });
    counts.forEach((count, date) => {
      countByDate.set(date, {
        due: count.routineTotal > 0,
        done: count.routineCompleted > 0,
      });
    });
  });

  const days: RoutineDay[] = [];
  for (const cursor = start; cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = formatDateToYmd(cursor);
    const count = countByDate.get(date);
    const isWithinRoutine =
      date >= routine.startDate && (!routine.endDate || date <= routine.endDate);

    let status: RoutineDayStatus;
    if (date > cutoffDate) {
      status = count?.due ? "upcoming" : "outside";
    } else if (count?.due) {
      status = count.done ? "done" : "missed";
    } else {
      status = isWithinRoutine ? "off" : "outside";
    }

    days.push({ date, day: cursor.getDay(), status });
  }

  return days;
};

const countDays = (days: RoutineDay[]): RoutineCount => {
  let total = 0;
  let done = 0;
  days.forEach(({ status }) => {
    if (status !== "done" && status !== "missed") return;
    total += 1;
    if (status === "done") done += 1;
  });
  return { total, done };
};

/**
 * 펼친 날들을 합계·요일별·반복 요일 이력 구간별로 센다.
 *
 * 구간은 보여 주는 기간과 겹치는 것만 담고, 그 기간 밖의 날은 세지 않는다.
 * 그래서 "바꾸기 전"이 기간 앞쪽에 조금만 걸치면 적은 횟수로 나온다.
 */
export const summarizeRoutineDays = ({
  routine,
  days,
}: {
  routine: RoutineForHistory;
  days: RoutineDay[];
}): RoutineHistorySummary => {
  const byWeekday = Array.from({ length: 7 }, (_, day) => ({
    day,
    ...countDays(days.filter((item) => item.day === day)),
  })).filter((item) => item.total > 0);

  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;
  const counted = days.filter(
    (day) => day.status === "done" || day.status === "missed",
  );
  const lastCounted = counted[counted.length - 1]?.date;
  const history = normalizeScheduleHistory(routine);

  const segments: RoutineScheduleSegment[] = [];
  if (first && last) {
    history.forEach((item, index) => {
      const next = history[index + 1];
      const segmentStart =
        item.effectiveFrom > routine.startDate ? item.effectiveFrom : routine.startDate;
      const segmentEnd = next
        ? shiftYmd(next.effectiveFrom, -1)
        : (routine.endDate ?? last);

      const from = segmentStart > first ? segmentStart : first;
      const until = segmentEnd < last ? segmentEnd : last;
      if (from > until) return;

      // 아직 오지 않은 날까지 구간으로 그리면 "~ 10월 3일"처럼 미래가 끝으로 보인다.
      // 구간 전체가 아직 오지 않았으면(내일부터 바뀌는 요일) 시작일만 남긴다.
      const shownUntil =
        lastCounted && until > lastCounted
          ? lastCounted < from
            ? from
            : lastCounted
          : until;

      segments.push({
        from,
        until: shownUntil,
        days: [...item.days].sort((a, b) => a - b),
        isCurrent: !next,
        ...countDays(days.filter((day) => day.date >= from && day.date <= until)),
      });
    });
  }

  return { ...countDays(days), byWeekday, segments };
};

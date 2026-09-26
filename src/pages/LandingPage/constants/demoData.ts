/**
 * 랜딩 필름에 나오는 예시 데이터.
 *
 * ⚠️ 실제 사용자의 기록이 아니다. 화면이 어떻게 움직이는지 보여 주기 위해 지어낸 값이며,
 * 달성률도 "이 정도는 나온다"는 약속이 아니다. 일부러 못 한 날을 섞어 두었다.
 * 숫자는 손으로 적지 않고 아래 일정과 체크 패턴에서 계산해, 장면끼리 어긋나지 않게 한다.
 */
import { COLORS } from "@/shared/constants/colors";
import {
  toPercent,
  type RangeSummary,
  type RangeSummaryDay,
} from "@/shared/api/monthlyStats/helpers/summarizeRange";

const colorOf = (name: string) =>
  COLORS.find((color) => color.name === name)?.value ?? "#000000";

/** 이야기 속 "오늘". 2026년 9월 6일 일요일 */
export const DEMO_YEAR = 2026;
export const DEMO_MONTH = 9;
export const DEMO_TODAY = 6;
/** 이야기가 끝나는 날 */
export const DEMO_LAST_DAY = 30;

export const DEMO_CATEGORIES = {
  inbox: { name: "할 일", color: colorOf("black") },
  health: { name: "건강", color: colorOf("green") },
  study: { name: "공부", color: colorOf("indigo") },
} as const;

export type DemoCategoryId = keyof typeof DEMO_CATEGORIES;

export interface DemoItem {
  id: string;
  title: string;
  kind: "task" | "routine";
  /** 정리된 뒤 속하는 분류 */
  category: DemoCategoryId;
  /** 루틴이 반복되는 요일 (0=일). 할 일은 비어 있다 */
  days: number[];
}

/**
 * 오프닝에서 쌓이는 순서이자, 섞인 목록의 원래 순서.
 * 할 일과 루틴이 일부러 섞여 있다. 마지막 물 한 잔 마시기가 이야기의 주인공이다.
 */
export const DEMO_ITEMS: DemoItem[] = [
  { id: "parcel", title: "택배 보내기", kind: "task", category: "inbox", days: [] },
  { id: "workout", title: "운동하기", kind: "routine", category: "health", days: [1, 3, 5] },
  { id: "homework", title: "과제 제출", kind: "task", category: "inbox", days: [] },
  { id: "medicine", title: "약 먹기", kind: "routine", category: "health", days: [0, 1, 2, 3, 4, 5, 6] },
  { id: "english", title: "영어 공부", kind: "routine", category: "study", days: [1, 2, 3, 4, 5] },
  { id: "hospital", title: "병원 예약", kind: "task", category: "inbox", days: [] },
  { id: "water", title: "물 한 잔 마시기", kind: "routine", category: "health", days: [0, 1, 2, 3, 4, 5, 6] },
];

export const HERO_ITEM_ID = "water";

/** 오늘 목록에 보이는 순서. 사용자가 체크한 주인공을 맨 위에 둔다 */
export const LIST_ORDER = [
  "water",
  "parcel",
  "workout",
  "homework",
  "medicine",
  "english",
  "hospital",
];

export const DEMO_TASKS = DEMO_ITEMS.filter((item) => item.kind === "task");
/** 주간 표의 행 순서 */
export const DEMO_ROUTINES = ["water", "workout", "medicine", "english"].map(
  (id) => DEMO_ITEMS.find((item) => item.id === id)!,
);

export const itemById = (id: string) => DEMO_ITEMS.find((item) => item.id === id)!;

/** 이번 주(9/6~9/12)의 날짜. 일요일부터 */
export const DEMO_WEEK = Array.from({ length: 7 }, (_, index) => DEMO_TODAY + index);

/**
 * 이번 주에 못 한 칸. "루틴 id:요일" 로 적는다.
 * 전부 채우면 완벽한 사람의 기록처럼 보여 오히려 믿기 어렵다.
 */
const WEEK_MISSES = new Set(["water:3", "workout:5", "medicine:6", "english:3"]);

export const isScheduled = (routine: DemoItem, weekday: number) =>
  routine.days.includes(weekday);

/** 이번 주 한 칸이 (그 요일이 채워진 뒤) 체크되는지 */
export const isWeekCellDone = (routine: DemoItem, weekday: number) =>
  isScheduled(routine, weekday) && !WEEK_MISSES.has(`${routine.id}:${weekday}`);

/** 칸이 지금 체크돼 있는지 판단하는 함수. 시점에 따라 달라지므로 호출부가 넘긴다 */
export type CellChecked = (routine: DemoItem, weekday: number) => boolean;

/** 이번 주가 전부 채워진 상태 */
export const FULL_WEEK: CellChecked = isWeekCellDone;

/** 요일별 합계 행 한 칸 ("3/4") */
export const getWeekTotal = (weekday: number, isChecked: CellChecked) => {
  const scheduled = DEMO_ROUTINES.filter((routine) => isScheduled(routine, weekday));
  const done = scheduled.filter((routine) => isChecked(routine, weekday)).length;
  return { done, total: scheduled.length };
};

/** 루틴 한 행의 합계 ("3 / 7") */
export const getRoutineRowTotal = (routine: DemoItem, isChecked: CellChecked) => {
  const scheduledDays = DEMO_WEEK.map((_, weekday) => weekday).filter((weekday) =>
    isScheduled(routine, weekday),
  );
  const done = scheduledDays.filter((weekday) => isChecked(routine, weekday)).length;
  return { done, total: scheduledDays.length };
};

export const getWeekday = (day: number) =>
  new Date(DEMO_YEAR, DEMO_MONTH - 1, day).getDay();

export const DAYS_IN_MONTH = new Date(DEMO_YEAR, DEMO_MONTH, 0).getDate();

/** 이번 주 밖의 날에 있던 할 일 수 (할 일은 매일 있지 않다) */
const TASKS_ON_DAY: Record<number, number> = {
  2: 1, 4: 2, 15: 1, 17: 2, 19: 1, 22: 1, 24: 2, 28: 1, 29: 1,
};

/** 그 밖의 날에 못 한 개수. 주 중반에 흔들리고 다시 붙는 흐름으로 적었다 */
const MISSED_ON_DAY: Record<number, number> = {
  1: 1, 3: 2, 5: 1, 14: 1, 16: 2, 17: 1, 18: 1, 19: 1, 20: 1, 21: 2, 23: 1, 24: 1,
  25: 1, 27: 1, 29: 1, 30: 0,
};

export interface DemoDay {
  day: number;
  total: number;
  completed: number;
  taskTotal: number;
  taskCompleted: number;
}

const routinesOn = (weekday: number) =>
  DEMO_ROUTINES.filter((routine) => isScheduled(routine, weekday)).length;

/** 한 달 치 날짜별 개수. 이번 주는 주간 표와 같은 규칙으로 센다 */
export const DEMO_MONTH_DAYS: DemoDay[] = Array.from(
  { length: DAYS_IN_MONTH },
  (_, index) => {
    const day = index + 1;
    const weekday = getWeekday(day);

    if (DEMO_WEEK.includes(day)) {
      const week = getWeekTotal(weekday, FULL_WEEK);
      // 오늘 목록의 할 일 셋은 주말 사이 둘을 끝냈다
      const taskTotal = day === DEMO_TODAY ? DEMO_TASKS.length : 0;
      const taskCompleted = day === DEMO_TODAY ? 2 : 0;
      return {
        day,
        total: week.total + taskTotal,
        completed: week.done + taskCompleted,
        taskTotal,
        taskCompleted,
      };
    }

    const taskTotal = TASKS_ON_DAY[day] ?? 0;
    const total = routinesOn(weekday) + taskTotal;
    const missed = Math.min(total, MISSED_ON_DAY[day] ?? 0);
    const taskCompleted = Math.max(0, taskTotal - (missed > 1 ? 1 : 0));
    return { day, total, completed: total - missed, taskTotal, taskCompleted };
  },
);

export const demoDay = (day: number) => DEMO_MONTH_DAYS[day - 1];

const pad = (value: number) => String(value).padStart(2, "0");
export const demoYmd = (day: number) => `${DEMO_YEAR}-${pad(DEMO_MONTH)}-${pad(day)}`;

/** 9월 30일 밤 기준 한 달 요약. 달성 현황 화면이 받는 모양 그대로다 */
export const DEMO_SUMMARY: RangeSummary = (() => {
  const days: RangeSummaryDay[] = DEMO_MONTH_DAYS.map((day) => ({
    date: demoYmd(day.day),
    total: day.total,
    completed: day.completed,
    upcoming: false,
  }));
  const sum = (pick: (day: DemoDay) => number) =>
    DEMO_MONTH_DAYS.reduce((total, day) => total + pick(day), 0);

  const total = sum((day) => day.total);
  const completed = sum((day) => day.completed);
  const taskTotal = sum((day) => day.taskTotal);
  const taskCompleted = sum((day) => day.taskCompleted);

  return {
    total,
    completed,
    taskTotal,
    taskCompleted,
    routineTotal: total - taskTotal,
    routineCompleted: completed - taskCompleted,
    upcoming: 0,
    hasSplit: true,
    days,
  };
})();

export const DEMO_RATE = toPercent(DEMO_SUMMARY.completed, DEMO_SUMMARY.total) ?? 0;
/** 지난달 이맘때와의 차이 (예시 값) */
export const DEMO_RATE_DELTA = 8;

export interface DemoWeekRow {
  firstDay: number;
  lastDay: number;
  total: number;
  completed: number;
}

/** 월간 막대의 주 구분. 실제 MonthWeekBars 처럼 일요일에서 끊는다 */
export const DEMO_WEEK_ROWS: DemoWeekRow[] = DEMO_MONTH_DAYS.reduce<DemoWeekRow[]>(
  (rows, day) => {
    if (rows.length === 0 || getWeekday(day.day) === 0) {
      rows.push({ firstDay: day.day, lastDay: day.day, total: 0, completed: 0 });
    }
    const row = rows[rows.length - 1];
    row.lastDay = day.day;
    row.total += day.total;
    row.completed += day.completed;
    return rows;
  },
  [],
);

/** 월간 막대의 길이 기준 (MonthWeekBars 처럼 가장 할 것이 많은 주) */
export const DEMO_BAR_MAX = Math.max(1, ...DEMO_WEEK_ROWS.map((row) => row.total));

export interface CalendarSlot {
  /** 달력 칸의 날짜. 이번 달이 아니면 inMonth 가 false 다 */
  day: number;
  inMonth: boolean;
  weekday: number;
}

/** 9월 달력의 칸. 주 단위 배열이며 첫 주와 마지막 주는 앞뒤 달 날짜로 채운다 */
export const DEMO_CALENDAR: CalendarSlot[][] = (() => {
  const first = new Date(DEMO_YEAR, DEMO_MONTH - 1, 1);
  const cursor = new Date(first);
  cursor.setDate(1 - first.getDay());

  const weeks: CalendarSlot[][] = [];
  while (weeks.length === 0 || cursor.getMonth() === DEMO_MONTH - 1) {
    const week: CalendarSlot[] = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      week.push({
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === DEMO_MONTH - 1,
        weekday,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
})();

/** 이번 주가 달력의 몇째 줄인지 */
export const DEMO_WEEK_ROW_INDEX = DEMO_CALENDAR.findIndex((week) =>
  week.some((slot) => slot.inMonth && slot.day === DEMO_TODAY),
);

import {
  getRepeatDaysByDate,
  hasExplicitScheduleHistory,
  normalizeScheduleHistory,
} from "@/shared/api/routine/schedule";
import type { RoutineScheduleHistoryItem } from "@/shared/api/routine/types";

/**
 * 한 달치 원본 기록을 날짜별 개수로 세는 유일한 집계기.
 *
 * 세는 규칙은 하나다. **그날 해야 했던 것이 전체, 그중 체크된 것이 완료다.**
 * 할 일은 문서가 곧 하루치지만, 루틴은 문서 하나가 여러 날에 걸치므로 날짜별로 펼쳐서 세야 한다.
 *
 * 이 계산을 쓰는 곳은 두 군데이고, 둘은 반드시 같은 수를 내야 한다.
 *  1) 서버 재계산 (recalculate.ts) — 집계가 어긋났을 때 원본에서 다시 세어 덮어쓴다
 *  2) 클라이언트 fallback (useMonthlyData) — monthlyStats 문서가 아직 없을 때 화면에서 센다
 *
 * 예전에는 두 곳이 같은 알고리즘을 각자 들고 있었다. 한쪽만 고치면 달력과 리포트가
 * 서로 다른 수를 말하게 되므로, 코어를 여기 한 벌만 둔다.
 */

// 아래 타입들은 세는 데 필요한 필드만 추린 것이다.
// 도메인 타입을 그대로 쓰면 여기서 안 쓰는 필드까지 따라와 무엇을 보고 세는지 흐려진다.
export type MonthlyTask = { id: string; date: string };
export type MonthlyTaskLog = {
  taskId: string;
  date: string;
  completed: boolean;
};
export type MonthlyRoutine = {
  id: string;
  startDate: string;
  endDate?: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
  /** 마지막 수정일(YYYY-MM-DD). 이력 없는 레거시 루틴의 게이트 기준이다. */
  updatedAt?: string | null;
};
export type MonthlyRoutineLog = {
  routineId: string;
  date: string;
  done: boolean;
};

/**
 * 세는 도중 쓰는 하루치 칸. 합산값과 함께 task/routine 몫을 따로 든다.
 *
 * 몫을 나눠 두면 한쪽만 바뀌었을 때 그 몫만 갈아 끼울 수 있다(recalculate 의 scope).
 * 몫이 필요 없는 호출부는 합산값 세 개만 읽으면 된다.
 */
export type DayCount = {
  total: number;
  completed: number;
  remaining: number;
  taskTotal: number;
  taskCompleted: number;
  routineTotal: number;
  routineCompleted: number;
};

/**
 * 한 달치 기록을 날짜별 개수로 센다. 반환값은 `YYYY-MM-DD` -> DayCount 다.
 *
 * 순서가 중요하다. 먼저 "해야 했던 것"을 세어 total 을 채우면서 유효한 조합을 기록해 두고,
 * 그다음 기록을 훑으며 그 조합에 해당하는 것만 completed 로 센다.
 * 이렇게 해야 지워진 할 일이나 더 이상 반복하지 않는 요일의 기록이 완료로 잡히지 않는다.
 */
export const buildMonthlyActivityCountMap = ({
  date,
  tasks,
  taskLogs,
  routines,
  routineLogs,
}: {
  date: Date;
  tasks: MonthlyTask[];
  taskLogs: MonthlyTaskLog[];
  routines: MonthlyRoutine[];
  routineLogs: MonthlyRoutineLog[];
}) => {
  // 날짜 -> 그날의 개수
  const next = new Map<string, DayCount>();

  // "이 날짜에 이 항목이 실제로 있었다"를 기록해 두는 집합.
  // 기록(로그)은 항목이 지워지거나 반복 요일이 바뀐 뒤에도 남아 있을 수 있어서,
  // 완료를 셀 때 이 집합에 있는 것만 인정한다.
  const validTaskKeySet = new Set<string>();
  const validRoutineKeySet = new Set<string>();

  /** 해당 날짜 칸이 없으면 0으로 만들어 두고 돌려준다 */
  const ensure = (dateKey: string) => {
    if (!next.has(dateKey)) {
      next.set(dateKey, {
        total: 0,
        completed: 0,
        remaining: 0,
        taskTotal: 0,
        taskCompleted: 0,
        routineTotal: 0,
        routineCompleted: 0,
      });
    }
    return next.get(dateKey)!;
  };

  // 할 일은 문서 하나가 곧 하루치라 그대로 센다
  tasks.forEach(({ id, date: dateKey }) => {
    const day = ensure(dateKey);
    day.total += 1;
    day.taskTotal += 1;
    validTaskKeySet.add(`${id}_${dateKey}`);
  });

  // 레거시 루틴 게이트에서 "실제 기록이 있는 날"을 찾기 위한 색인
  const logDatesByRoutine = new Map<string, Set<string>>();
  routineLogs.forEach(({ routineId, date: dateKey }) => {
    if (!logDatesByRoutine.has(routineId)) {
      logDatesByRoutine.set(routineId, new Set());
    }
    logDatesByRoutine.get(routineId)!.add(dateKey);
  });

  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  // 루틴은 문서 하나가 여러 날에 걸치므로, 그달 1일부터 말일까지 훑으며
  // 실제로 해야 했던 날만 골라 하루치로 펼쳐 센다.
  routines.forEach((routine) => {
    const { id, startDate, endDate } = routine;
    const history = normalizeScheduleHistory(routine);

    // 주간 리포트(report.ts)와 같은 게이트: 이력 없는 레거시 루틴은
    // 마지막 수정일 이전 날짜를 숨기되, 실제 기록이 있는 날은 남긴다.
    // 여기서도 같은 규칙으로 세지 않으면, 리포트에는 칸이 없어 체크할 수
    // 없는 날이 달력에는 미완료로 영영 남는다.
    const legacyGateFrom = hasExplicitScheduleHistory(routine.scheduleHistory)
      ? null
      : routine.updatedAt;
    const logDates = logDatesByRoutine.get(id);

    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d,
      ).padStart(2, "0")}`;

      // 루틴이 살아 있던 기간 밖은 건너뛴다. endDate 가 없으면 끝나지 않은 루틴이다.
      const isAfterStart = dateStr >= startDate;
      const isBeforeEnd = !endDate || dateStr <= endDate;
      if (!isAfterStart || !isBeforeEnd) continue;

      const repeatDays = getRepeatDaysByDate({ history, date: dateStr });
      const isRepeatDay = repeatDays.includes(dateObj.getDay());
      const isCounted = legacyGateFrom
        ? Boolean(logDates?.has(dateStr)) ||
          (isRepeatDay && dateStr >= legacyGateFrom)
        : isRepeatDay;

      if (isCounted) {
        const day = ensure(dateStr);
        day.total += 1;
        day.routineTotal += 1;
        validRoutineKeySet.add(`${id}_${dateStr}`);
      }
    }
  });

  // 완료를 센다. 체크 안 된 기록, 그달 밖 기록, 그리고 위에서 세지 않은 조합은 제외한다.
  // 마지막 조건이 없으면 지워진 할 일의 기록이 완료로 잡혀 완료가 전체보다 많아질 수 있다.
  taskLogs.forEach(({ taskId, date: dateKey, completed }) => {
    if (!completed) return;
    if (!next.has(dateKey)) return;
    if (!validTaskKeySet.has(`${taskId}_${dateKey}`)) return;
    const day = ensure(dateKey);
    day.completed += 1;
    day.taskCompleted += 1;
  });

  // 루틴도 같은 규칙이다. 반복 요일을 바꾸기 전에 남긴 기록이
  // 이제는 해당하지 않는 날짜라면 완료로 세지 않는다.
  routineLogs.forEach(({ routineId, date: dateKey, done }) => {
    if (!done) return;
    if (!next.has(dateKey)) return;
    if (!validRoutineKeySet.has(`${routineId}_${dateKey}`)) return;
    const day = ensure(dateKey);
    day.completed += 1;
    day.routineCompleted += 1;
  });

  // 남은 개수는 따로 세지 않고 전체에서 완료를 뺀다.
  // 위 필터 덕분에 음수가 날 일은 없지만, 어긋난 데이터가 들어와도 0 아래로는 가지 않게 막는다.
  next.forEach((value) => {
    value.remaining = Math.max(value.total - value.completed, 0);
  });

  return next;
};

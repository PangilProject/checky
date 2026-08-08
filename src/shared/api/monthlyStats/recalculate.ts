import type { RoutineScheduleHistoryItem } from "@/shared/api/routine";
import { getRoutinesByMonthOnce, getRoutineLogsByMonthOnce } from "@/shared/api/routine/queries";
import { getTasksByMonthOnce } from "@/shared/api/task/queries";
import { getTaskLogsByMonthOnce } from "@/shared/api/taskLog/queries";
import { replaceMonthlyStatsByMonth } from "./queries";
import type { MonthlyActivitySummary } from "./types";

/**
 * 원본 기록에서 월간 요약을 처음부터 다시 센다.
 *
 * 평상시에는 할 일을 더하거나 체크할 때마다 요약을 조금씩 고쳐 나간다(queries.ts 의 patch 계열).
 * 그 방식은 싸지만, 중간에 실패하거나 순서가 꼬이면 요약과 실제 기록이 어긋난다.
 * 이 파일은 어긋났을 때 원본을 전부 읽어 요약을 새로 만들어 덮어쓰는 쪽을 맡는다.
 *
 * 세는 규칙은 하나다. **그날 해야 했던 것이 전체, 그중 체크된 것이 완료다.**
 * 할 일은 문서가 곧 하루치지만, 루틴은 문서 하나가 여러 날에 걸치므로 날짜별로 펼쳐서 세야 한다.
 */

// 아래 타입들은 세는 데 필요한 필드만 추린 것이다.
// 도메인 타입을 그대로 쓰면 여기서 안 쓰는 필드까지 따라와 무엇을 보고 세는지 흐려진다.
type MonthlyTask = { id: string; date: string };
type MonthlyTaskLog = { taskId: string; date: string; completed: boolean };
type MonthlyRoutine = {
  id: string;
  startDate: string;
  endDate?: string;
  days: number[];
  scheduleHistory?: RoutineScheduleHistoryItem[];
};
type MonthlyRoutineLog = { routineId: string; date: string; done: boolean };

/**
 * 한 달치 기록을 날짜별 개수로 센다.
 *
 * 반환값은 `YYYY-MM-DD` -> { total, completed, remaining } 형태의 Map 이다.
 *
 * 순서가 중요하다. 먼저 "해야 했던 것"을 세어 total 을 채우면서 유효한 조합을 기록해 두고,
 * 그다음 기록을 훑으며 그 조합에 해당하는 것만 completed 로 센다.
 * 이렇게 해야 지워진 할 일이나 더 이상 반복하지 않는 요일의 기록이 완료로 잡히지 않는다.
 */
const buildMonthlyActivityCountMap = ({
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
  const next = new Map<string, { total: number; completed: number; remaining: number }>();

  // "이 날짜에 이 항목이 실제로 있었다"를 기록해 두는 집합.
  // 기록(로그)은 항목이 지워지거나 반복 요일이 바뀐 뒤에도 남아 있을 수 있어서,
  // 완료를 셀 때 이 집합에 있는 것만 인정한다.
  const validTaskKeySet = new Set<string>();
  const validRoutineKeySet = new Set<string>();

  /** 해당 날짜 칸이 없으면 0으로 만들어 두고 돌려준다 */
  const ensure = (dateKey: string) => {
    if (!next.has(dateKey)) {
      next.set(dateKey, { total: 0, completed: 0, remaining: 0 });
    }
    return next.get(dateKey)!;
  };

  /**
   * 그날 적용되던 반복 요일을 찾는다.
   *
   * 이력은 시간순으로 정렬돼 있으므로 뒤에서부터 훑어, 그날보다 앞선 첫 항목을 쓴다.
   * 요일을 바꾸기 전 날짜에는 예전 요일이 그대로 적용돼, 지난 기록이 틀어지지 않는다.
   * 시작일보다 앞선 날짜는 해당하는 이력이 없으므로 빈 배열이 되어 아무 날도 세지 않는다.
   */
  const getRepeatDaysByDate = ({
    history,
    date,
  }: {
    history: RoutineScheduleHistoryItem[];
    date: string;
  }) => {
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i];
      if (item.effectiveFrom <= date) return item.days;
    }
    return [];
  };

  // 할 일은 문서 하나가 곧 하루치라 그대로 센다
  tasks.forEach(({ id, date: dateKey }) => {
    ensure(dateKey).total += 1;
    validTaskKeySet.add(`${id}_${dateKey}`);
  });

  // 루틴은 문서 하나가 여러 날에 걸치므로, 그달 1일부터 말일까지 훑으며
  // 실제로 해야 했던 날만 골라 하루치로 펼쳐 센다.
  routines.forEach((routine) => {
    const { id, startDate, endDate } = routine;
    // scheduleHistory 가 생기기 전에 만들어진 루틴은 이력이 없으므로,
    // 시작일부터 현재 요일이 계속 적용됐다고 보고 한 건짜리 이력을 만들어 쓴다.
    const history =
      routine.scheduleHistory && routine.scheduleHistory.length > 0
        ? [...routine.scheduleHistory].sort((a, b) =>
            a.effectiveFrom.localeCompare(b.effectiveFrom)
          )
        : [{ effectiveFrom: startDate, days: routine.days }];

    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;

      // 루틴이 살아 있던 기간 밖은 건너뛴다. endDate 가 없으면 끝나지 않은 루틴이다.
      const isAfterStart = dateStr >= startDate;
      const isBeforeEnd = !endDate || dateStr <= endDate;
      if (!isAfterStart || !isBeforeEnd) continue;

      const repeatDays = getRepeatDaysByDate({ history, date: dateStr });
      if (repeatDays.includes(dateObj.getDay())) {
        ensure(dateStr).total += 1;
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
    ensure(dateKey).completed += 1;
  });

  // 루틴도 같은 규칙이다. 반복 요일을 바꾸기 전에 남긴 기록이
  // 이제는 해당하지 않는 날짜라면 완료로 세지 않는다.
  routineLogs.forEach(({ routineId, date: dateKey, done }) => {
    if (!done) return;
    if (!next.has(dateKey)) return;
    if (!validRoutineKeySet.has(`${routineId}_${dateKey}`)) return;
    ensure(dateKey).completed += 1;
  });

  // 남은 개수는 따로 세지 않고 전체에서 완료를 뺀다.
  // 위 필터 덕분에 음수가 날 일은 없지만, 어긋난 데이터가 들어와도 0 아래로는 가지 않게 막는다.
  next.forEach((value) => {
    value.remaining = Math.max(value.total - value.completed, 0);
  });

  return next;
};

/**
 * 날짜별 Map 을 monthlyStats 문서에 넣을 형태로 바꾼다.
 *
 * 문서가 이미 월 단위로 나뉘어 있어 키에 연·월을 되풀이할 필요가 없으므로,
 * `2026-08-15` 대신 `15` 를 키로 쓴다.
 * 다른 달 날짜가 섞여 들어오면 걸러 낸다.
 */
const convertToMonthlyStatsDays = ({
  monthKey,
  map,
}: {
  monthKey: string;
  map: Map<string, { total: number; completed: number; remaining: number }>;
}) => {
  const days: Record<string, MonthlyActivitySummary> = {};

  map.forEach((value, dateKey) => {
    if (!dateKey.startsWith(`${monthKey}-`)) return;
    const day = dateKey.slice(8, 10);
    days[day] = {
      total: value.total,
      completed: value.completed,
      remaining: value.remaining,
      hasActivity: value.total > 0,
    };
  });
  return days;
};

/**
 * 원본 기록에서 한 달치 집계를 다시 계산해 덮어쓴다.
 *
 * 할 일·완료 기록·루틴·루틴 기록 네 컬렉션을 그 달 범위로 모두 읽으므로 비용이 크다.
 * 증감 반영이 어긋나 집계가 실제와 달라졌을 때 되돌리는 용도이며,
 * 평상시 갱신에는 patch 계열을 쓴다.
 */
export const recalculateMonthlyStatsByMonth = async ({
  userId,
  month,
}: {
  userId: string;
  month: string;
}) => {
  const [tasks, taskLogs, routines, routineLogs] = await Promise.all([
    getTasksByMonthOnce({ userId, month }),
    getTaskLogsByMonthOnce({ userId, month }),
    getRoutinesByMonthOnce({ userId, month }),
    getRoutineLogsByMonthOnce({ userId, month }),
  ]);

  const [year, monthIndex] = month.split("-").map(Number);
  const map = buildMonthlyActivityCountMap({
    date: new Date(year, monthIndex - 1, 1),
    tasks,
    taskLogs,
    routines,
    routineLogs,
  });
  const days = convertToMonthlyStatsDays({ monthKey: month, map });
  await replaceMonthlyStatsByMonth({ userId, month, days });
};

/**
 * 두 날짜가 걸쳐 있는 달의 키 목록을 만든다.
 *
 * 할 일을 다른 달로 옮기면 두 달의 집계가 함께 바뀌므로, 갱신 대상을 정할 때 쓴다.
 * 순수 계산이며 Firestore 를 읽지 않는다. 범위가 뒤집혀 있으면 빈 배열이다.
 */
export const buildMonthKeysBetween = (startDate: string, endDate: string) => {
  if (!startDate || !endDate || startDate > endDate) return [] as string[];

  const [startYear, startMonth] = startDate.slice(0, 7).split("-").map(Number);
  const [endYear, endMonth] = endDate.slice(0, 7).split("-").map(Number);
  const result: string[] = [];

  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    result.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      y += 1;
      m = 1;
    }
  }

  return result;
};

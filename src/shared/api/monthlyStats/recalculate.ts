import { getRoutinesByMonthOnce, getRoutineLogsByMonthOnce } from "@/shared/api/routine/queries";
import { getTasksByMonthOnce } from "@/shared/api/task/queries";
import { getTaskLogsByMonthOnce } from "@/shared/api/taskLog/queries";
import { buildMonthlyActivityCountMap } from "./countMonth";
import type { DayCount } from "./countMonth";
import { getMonthlyStatsByMonthOnce, replaceMonthlyStatsByMonth } from "./queries";
import { MONTHLY_STATS_SPLIT_VERSION } from "./types";
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
  map: Map<string, DayCount>;
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
      taskTotal: value.taskTotal,
      taskCompleted: value.taskCompleted,
      routineTotal: value.routineTotal,
      routineCompleted: value.routineCompleted,
    };
  });
  return days;
};

/** 다시 셀 범위. 바뀐 몫만 지정하면 나머지 몫은 기존 문서 값을 그대로 쓴다. */
export type RecalculateScope = "all" | "task" | "routine";

/**
 * 한쪽 몫만 새로 센 결과를 기존 문서의 반대쪽 몫과 합친다.
 *
 * 두 몫의 날짜 집합이 다를 수 있어 합집합을 돌며, 합계가 0이 된 날은 버린다.
 * replace 로 덮어쓰므로 버려진 날은 문서에서도 사라진다.
 */
const mergeScopedDays = ({
  scope,
  existingDays,
  freshDays,
}: {
  scope: "task" | "routine";
  existingDays: Record<string, MonthlyActivitySummary>;
  freshDays: Record<string, MonthlyActivitySummary>;
}) => {
  const days: Record<string, MonthlyActivitySummary> = {};
  const dayKeys = new Set([
    ...Object.keys(existingDays),
    ...Object.keys(freshDays),
  ]);

  dayKeys.forEach((day) => {
    const preserved = existingDays[day];
    const fresh = freshDays[day];
    const fromTask = scope === "task" ? fresh : preserved;
    const fromRoutine = scope === "routine" ? fresh : preserved;

    const taskTotal = fromTask?.taskTotal ?? 0;
    const taskCompleted = fromTask?.taskCompleted ?? 0;
    const routineTotal = fromRoutine?.routineTotal ?? 0;
    const routineCompleted = fromRoutine?.routineCompleted ?? 0;

    const total = taskTotal + routineTotal;
    if (total === 0) return;

    const completed = Math.min(taskCompleted + routineCompleted, total);
    days[day] = {
      total,
      completed,
      remaining: Math.max(total - completed, 0),
      hasActivity: true,
      taskTotal,
      taskCompleted,
      routineTotal,
      routineCompleted,
    };
  });

  return days;
};

/**
 * 원본 기록에서 한 달치 집계를 다시 계산해 덮어쓴다.
 *
 * scope 로 다시 셀 몫을 좁힐 수 있다. 할 일만 바뀌었으면 "task", 루틴만 바뀌었으면
 * "routine" 을 넘겨 해당 몫의 두 컬렉션만 읽고, 반대쪽 몫은 기존 문서에서 가져온다.
 * 몫이 나뉘어 있지 않은 옛 문서(version 1)는 전체 재계산으로 대신해 세대를 올린다.
 *
 * "all" 은 네 컬렉션을 그 달 범위로 모두 읽으므로 비용이 크다.
 * 증감 반영이 어긋나 집계가 실제와 달라졌을 때 되돌리는 용도이며,
 * 평상시 갱신에는 patch 계열을 쓴다.
 */
export const recalculateMonthlyStatsByMonth = async ({
  userId,
  month,
  scope = "all",
}: {
  userId: string;
  month: string;
  scope?: RecalculateScope;
}) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const monthDate = new Date(year, monthIndex - 1, 1);

  if (scope !== "all") {
    const existing = await getMonthlyStatsByMonthOnce({ userId, month });
    const isSplit =
      existing != null &&
      (existing.version ?? 1) >= MONTHLY_STATS_SPLIT_VERSION;

    if (isSplit) {
      // 바뀐 몫의 두 컬렉션만 읽는다. 반대쪽 몫은 기존 문서가 이미 들고 있다.
      const [tasks, taskLogs] =
        scope === "task"
          ? await Promise.all([
              getTasksByMonthOnce({ userId, month }),
              getTaskLogsByMonthOnce({ userId, month }),
            ])
          : [[], []];
      const [routines, routineLogs] =
        scope === "routine"
          ? await Promise.all([
              getRoutinesByMonthOnce({ userId, month }),
              getRoutineLogsByMonthOnce({ userId, month }),
            ])
          : [[], []];

      const map = buildMonthlyActivityCountMap({
        date: monthDate,
        tasks,
        taskLogs,
        routines,
        routineLogs,
      });
      const freshDays = convertToMonthlyStatsDays({ monthKey: month, map });
      const days = mergeScopedDays({
        scope,
        existingDays: existing.days ?? {},
        freshDays,
      });
      await replaceMonthlyStatsByMonth({
        userId,
        month,
        days,
        version: MONTHLY_STATS_SPLIT_VERSION,
      });
      return;
    }
    // 몫이 없는 문서는 부분 교체가 불가능하므로 전체 재계산으로 떨어진다.
  }

  const [tasks, taskLogs, routines, routineLogs] = await Promise.all([
    getTasksByMonthOnce({ userId, month }),
    getTaskLogsByMonthOnce({ userId, month }),
    getRoutinesByMonthOnce({ userId, month }),
    getRoutineLogsByMonthOnce({ userId, month }),
  ]);

  const map = buildMonthlyActivityCountMap({
    date: monthDate,
    tasks,
    taskLogs,
    routines,
    routineLogs,
  });
  const days = convertToMonthlyStatsDays({ monthKey: month, map });
  await replaceMonthlyStatsByMonth({
    userId,
    month,
    days,
    version: MONTHLY_STATS_SPLIT_VERSION,
  });
};


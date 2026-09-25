import { toPercent, type RangeSummary } from "@/shared/api/monthlyStats";
import { Text } from "@/shared/ui/primitives";
import type { AchievementMode, AchievementRanges } from "../utils/getAchievementRanges";
import { WeekDayBars } from "./WeekDayBars";
import { MonthWeekBars } from "./MonthWeekBars";

interface AchievementSummaryProps {
  mode: AchievementMode;
  status: AchievementRanges["status"];
  summary: RangeSummary;
  compareSummary: RangeSummary | null;
  /** 비교 기간이 시작하는 달 (두 자리). 월간 비교 문구에 쓴다 */
  compareMonth?: string;
  todayYmd: string;
}

/** 지난 기간과의 차이. 지난 기간에 셀 것이 없었으면 보여 주지 않는다. */
const Delta = ({
  mode,
  status,
  rate,
  compareSummary,
  compareMonth,
}: {
  mode: AchievementMode;
  status: AchievementRanges["status"];
  rate: number;
  compareSummary: RangeSummary | null;
  compareMonth?: string;
}) => {
  const prevRate = compareSummary
    ? toPercent(compareSummary.completed, compareSummary.total)
    : null;
  if (prevRate === null) return null;

  const base =
    mode === "week" ? "지난주" : `${Number(compareMonth)}월`;
  const label = status === "current" ? `${base} 이맘때` : base;
  const diff = rate - prevRate;

  if (diff === 0) {
    return (
      <Text variant="caption" tone="muted" className="font-bold">
        {label}와 같아요
      </Text>
    );
  }

  return (
    <Text
      variant="caption"
      tone={diff > 0 ? "success" : "muted"}
      className="font-bold whitespace-nowrap"
    >
      {label}보다 {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}%p
    </Text>
  );
};

const SplitRow = ({
  label,
  completed,
  total,
}: {
  label: string;
  completed: number;
  total: number;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between text-sm">
      <span>{label}</span>
      <span>
        <b className="text-base">{completed}</b> / {total}
      </span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-sm bg-line">
      <div
        className="h-full rounded-sm bg-primary"
        style={{ width: `${toPercent(completed, total) ?? 0}%` }}
      />
    </div>
  </div>
);

const LegendSwatch = ({ className }: { className: string }) => (
  <i aria-hidden="true" className={`inline-block h-2.5 w-2.5 rounded-xs ${className}`} />
);

/**
 * 달성 현황 본문. 큰 달성률, 할 일·루틴 나눔, 요일별(주간) 또는 주차별(월간) 막대를 그린다.
 */
export const AchievementSummary = ({
  mode,
  status,
  summary,
  compareSummary,
  compareMonth,
  todayYmd,
}: AchievementSummaryProps) => {
  const rate = toPercent(summary.completed, summary.total);
  const isEmpty = summary.total === 0 && summary.upcoming === 0;

  return (
    <div className="mt-2.5 flex flex-col gap-3.5 rounded-xl bg-surface-sunken p-4">
      {isEmpty ? (
        <Text variant="bodySm" tone="muted" className="py-4 text-center">
          이 기간에 만든 할 일과 루틴이 없어요.
        </Text>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-2.5">
            {rate === null ? (
              <div>
                <p className="text-2xl font-bold">아직 시작 전이에요</p>
                <Text variant="bodySm" tone="muted" className="mt-1.5">
                  예정된 할 일과 루틴 {summary.upcoming}개
                </Text>
              </div>
            ) : (
              <div>
                <p className="text-3xl leading-none font-extrabold">
                  {rate}
                  <small className="ml-0.5 text-base font-bold">%</small>
                </p>
                <Text variant="bodySm" tone="muted" className="mt-1.5">
                  {status === "current" ? "오늘까지 " : ""}
                  {summary.total}개 중{" "}
                  <b className="text-content">{summary.completed}개</b> 해냈어요
                </Text>
              </div>
            )}
            {rate !== null && (
              <Delta
                mode={mode}
                status={status}
                rate={rate}
                compareSummary={compareSummary}
                compareMonth={compareMonth}
              />
            )}
          </div>

          {rate !== null &&
            (summary.hasSplit ? (
              <div className="grid grid-cols-2 gap-3">
                <SplitRow
                  label="할 일"
                  completed={summary.taskCompleted}
                  total={summary.taskTotal}
                />
                <SplitRow
                  label="루틴"
                  completed={summary.routineCompleted}
                  total={summary.routineTotal}
                />
              </div>
            ) : (
              <Text variant="caption" tone="muted">
                할 일과 루틴을 나눠 세는 중이에요.
              </Text>
            ))}

          {mode === "week" ? (
            <WeekDayBars days={summary.days} todayYmd={todayYmd} />
          ) : (
            <MonthWeekBars days={summary.days} todayYmd={todayYmd} />
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
            <span className="inline-flex items-center gap-1.5">
              <LegendSwatch className="bg-primary" />
              완료
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LegendSwatch className="bg-line" />
              못 함
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LegendSwatch className="border border-dashed border-content-muted" />
              예정
            </span>
            {summary.upcoming > 0 && (
              <span className="ml-auto">남은 예정 {summary.upcoming}개</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

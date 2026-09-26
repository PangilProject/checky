/**
 * 랜딩 필름에 나오는 달성 현황의 겉모습.
 * 클래스는 AchievementReport/components/AchievementSummary.tsx, MonthWeekBars.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import { Text } from "@/shared/ui/primitives";

/** 월간 막대 한 줄의 막대 부분 (MonthWeekBars). 완료와 못 함 두 조각이다 */
export const WeekBar = ({ completed, total, max }: { completed: number; total: number; max: number }) => (
  <div className="flex h-2.5 w-full gap-0.5">
    {completed > 0 && (
      <i className="block h-full rounded-xs bg-primary" style={{ width: `${(completed / max) * 100}%` }} />
    )}
    {total - completed > 0 && (
      <i className="block h-full rounded-xs bg-line" style={{ width: `${((total - completed) / max) * 100}%` }} />
    )}
  </div>
);

/** 월간 막대 한 줄의 주차 이름 (MonthWeekBars) */
export const WeekBarLabel = ({
  index,
  firstDay,
  lastDay,
}: {
  index: number;
  firstDay: number;
  lastDay: number;
}) => (
  <>
    {index + 1}주{" "}
    <span className="text-xs font-normal text-content-muted">
      {firstDay}~{lastDay}
    </span>
  </>
);

/** 달성 현황의 할 일·루틴 나눔 한 줄 (AchievementSummary 의 SplitRow) */
export const SplitRowView = ({
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
      <div className="h-full rounded-sm bg-primary" style={{ width: `${(completed / total) * 100}%` }} />
    </div>
  </div>
);

/** 범례 (AchievementSummary) */
export const LegendView = () => (
  <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
    <span className="inline-flex items-center gap-1.5">
      <i aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-xs bg-primary" />
      완료
    </span>
    <span className="inline-flex items-center gap-1.5">
      <i aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-xs bg-line" />
      못 함
    </span>
  </div>
);

/** 큰 달성률 (AchievementSummary). 필름은 data-rate 의 숫자를 직접 바꾼다 */
export const RateView = ({ rate }: { rate: number }) => (
  <p className="text-3xl leading-none font-extrabold whitespace-nowrap">
    <span data-rate="">{rate}</span>
    <small className="ml-0.5 text-base font-bold">%</small>
  </p>
);

/** 달성률 아래 설명 (AchievementSummary). 이번 달을 보고 있으므로 "오늘까지" 가 붙는다 */
export const RateTextView = ({ completed, total }: { completed: number; total: number }) => (
  <Text variant="bodySm" tone="muted" className="whitespace-nowrap">
    오늘까지 {total}개 중 <b className="text-content">{completed}개</b> 해냈어요
  </Text>
);

/** 지난 기간과의 차이 (AchievementSummary 의 Delta). 이번 달이라 "이맘때" 와 비교한다 */
export const DeltaView = ({ month, diff }: { month: number; diff: number }) => (
  <Text variant="caption" tone="success" className="font-bold whitespace-nowrap">
    {month}월 이맘때보다 ▲ {diff}%p
  </Text>
);

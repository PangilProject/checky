import { toPercent } from "@/shared/api/monthlyStats/helpers/summarizeRange";
import {
  DEMO_BAR_MAX,
  DEMO_MONTH,
  DEMO_RATE,
  DEMO_RATE_DELTA,
  DEMO_SUMMARY,
  DEMO_WEEK_ROWS,
} from "../../constants/demoData";
import { MONTH_LABEL } from "../../utils/storyLabels";
import {
  DeltaView,
  LegendView,
  RateTextView,
  RateView,
  SplitRowView,
  WeekBar,
  WeekBarLabel,
} from "../AppMock/AchievementSummary";
import { AppHeaderAnchors, Anchor, Caption, FrameLayout, ScreenArea, type FrameMode } from "./FrameLayout";
import { SectionHead } from "./SectionHead";
import { COPY } from "../../constants/copy";

/**
 * 한 달이 쌓인 장면 (AchievementReport 의 월간 보기).
 * 달력의 주마다 모인 링이 이 장면에서 주별 막대가 된다.
 * 숫자는 constants/demoData.ts 의 예시 기록에서 계산한 값이다.
 */
export const StatsFrame = ({ mode }: { mode: FrameMode }) => (
  <FrameLayout
    id="stats"
    mode={mode}
    caption={
      <Caption id="stats" mode={mode}>
        {COPY.stats}
      </Caption>
    }
  >
    <ScreenArea mode={mode} className="max-w-[32rem]">
      <AppHeaderAnchors />
      <SectionHead slot="main" title="달성 현황" subTitle={MONTH_LABEL} controls="mode" />
      <div className="relative mt-2.5">
        <Anchor id="panel" className="absolute inset-0 rounded-xl bg-surface-sunken" />
        <div className="relative flex flex-col gap-3.5 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2.5">
            <div>
              <Anchor id="rate" className="w-fit">
                <RateView rate={DEMO_RATE} />
              </Anchor>
              <Anchor id="rateText" className="mt-1.5 w-fit">
                <RateTextView completed={DEMO_SUMMARY.completed} total={DEMO_SUMMARY.total} />
              </Anchor>
            </div>
            <Anchor id="delta">
              <DeltaView month={DEMO_MONTH - 1} diff={DEMO_RATE_DELTA} />
            </Anchor>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Anchor id="split:task">
              <SplitRowView
                label="할 일"
                completed={DEMO_SUMMARY.taskCompleted}
                total={DEMO_SUMMARY.taskTotal}
              />
            </Anchor>
            <Anchor id="split:routine">
              <SplitRowView
                label="루틴"
                completed={DEMO_SUMMARY.routineCompleted}
                total={DEMO_SUMMARY.routineTotal}
              />
            </Anchor>
          </div>
          {/* 주차별 막대 (MonthWeekBars) */}
          <div className="flex flex-col gap-2">
            {DEMO_WEEK_ROWS.map((row, index) => (
              <div
                key={row.firstDay}
                className="grid grid-cols-[62px_1fr_52px] items-center gap-2.5 text-[12.5px]"
              >
                <span>
                  <Anchor id={`barLabel:${index}`} as="span" className="whitespace-nowrap">
                    <WeekBarLabel index={index} firstDay={row.firstDay} lastDay={row.lastDay} />
                  </Anchor>
                </span>
                <Anchor id={`bar:${index}`}>
                  <WeekBar completed={row.completed} total={row.total} max={DEMO_BAR_MAX} />
                </Anchor>
                <span className="text-right text-content-muted">
                  <Anchor id={`barPct:${index}`} as="span">
                    {`${toPercent(row.completed, row.total) ?? 0}%`}
                  </Anchor>
                </span>
              </div>
            ))}
          </div>
          <Anchor id="legend">
            <LegendView />
          </Anchor>
        </div>
      </div>
    </ScreenArea>
  </FrameLayout>
);

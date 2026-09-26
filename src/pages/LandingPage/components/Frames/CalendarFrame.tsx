import { WEEK_LABELS, getWeekendTextClass } from "@/shared/constants/dateLabels";
import { Text, cn } from "@/shared/ui/primitives";
import { DEMO_CALENDAR, demoDay } from "../../constants/demoData";
import { MONTH_LABEL } from "../../utils/storyLabels";
import { CalendarDate, CalendarRing } from "../AppMock/CalendarCell";
import { AppHeaderAnchors, Anchor, Caption, FrameLayout, ScreenArea, type FrameMode } from "./FrameLayout";
import { SectionHead } from "./SectionHead";
import { COPY } from "../../constants/copy";

/**
 * 달력 장면 (MonthlyReport). 주간 표의 일곱 열이 그대로 달력의 한 주가 된다.
 * filledUntil 날짜까지는 기록이 채워져 있고, 그 뒤는 아직 오지 않은 날이다.
 */
export const CalendarFrame = ({
  mode,
  filledUntil,
}: {
  mode: FrameMode;
  filledUntil: number;
}) => (
  <FrameLayout
    id="calendar"
    mode={mode}
    caption={
      <Caption id="calendar" mode={mode}>
        {COPY.calendar}
      </Caption>
    }
  >
    <ScreenArea mode={mode} className="max-w-[36rem]">
      <AppHeaderAnchors />
      <SectionHead slot="main" title="캘린더" subTitle={MONTH_LABEL} />
      <Anchor id="calgrid" className="mt-2">
        {/* 요일 머리 (CalendarHeader) */}
        <div className="relative flex w-full">
          {WEEK_LABELS.map((label, weekday) => (
            <div key={label} className="w-[14.285%] py-2 text-center font-medium">
              <Anchor id={`hl:${weekday}`} className={cn("inline-block", getWeekendTextClass(weekday))}>
                <Text variant="bodySm" as="span">
                  {label}
                </Text>
              </Anchor>
            </div>
          ))}
          <Anchor id="line:head" className="absolute inset-x-0 bottom-0 h-px bg-content-muted" />
        </div>
        {/* 날짜 칸 (CalendarBody, CalendarCell) */}
        <div className="flex w-full flex-wrap">
          {DEMO_CALENDAR.map((week, row) =>
            week.map((slot) => {
              const day = slot.inMonth ? demoDay(slot.day) : undefined;
              const isFilled = slot.inMonth && slot.day <= filledUntil;
              return (
                <div
                  key={`${row}-${slot.weekday}`}
                  className="flex h-15 w-[14.285%] flex-col items-center justify-center gap-1"
                >
                  <Anchor id={`cal:${row}:${slot.weekday}`}>
                    <CalendarRing
                      inMonth={slot.inMonth}
                      total={day?.total}
                      completed={isFilled ? day?.completed : 0}
                    />
                  </Anchor>
                  <Anchor id={`cd:${row}:${slot.weekday}`}>
                    <CalendarDate day={slot.day} weekday={slot.weekday} inMonth={slot.inMonth} />
                  </Anchor>
                </div>
              );
            }),
          )}
        </div>
      </Anchor>
    </ScreenArea>
  </FrameLayout>
);

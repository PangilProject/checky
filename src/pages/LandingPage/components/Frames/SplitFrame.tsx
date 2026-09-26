import type { CSSProperties, ReactNode } from "react";
import { WEEK_LABELS } from "@/shared/constants/dateLabels";
import { cn } from "@/shared/ui/primitives";
import {
  DEMO_CATEGORIES,
  DEMO_ROUTINES,
  DEMO_TASKS,
  DEMO_TODAY,
  DEMO_WEEK,
  getRoutineRowTotal,
  getWeekTotal,
  isScheduled,
  type CellChecked,
} from "../../constants/demoData";
import { WEEK_LABEL, getTaskSubTitle } from "../../utils/storyLabels";
import { CategoryHeader } from "../AppMock/AddCategory";
import { CheckIcon, DashIcon } from "../AppMock/CheckIcon";
import { CellText, WeekdayLabel } from "../AppMock/RoutineTable";
import { TaskRowTitle } from "../AppMock/TaskRowTitle";
import { AppHeaderAnchors, Anchor, Caption, FrameLayout, ScreenArea, type FrameMode } from "./FrameLayout";
import { SectionHead } from "./SectionHead";
import { COPY } from "../../constants/copy";

/** 표의 칸 한 개. 위치를 모두 명시해야 선(line:*)을 칸 위에 겹쳐 둘 수 있다 */
const GridCell = ({
  id,
  column,
  row,
  children,
  className,
}: {
  id: string;
  column: number;
  row: number;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn("flex h-10 items-center justify-center", className)}
    style={{ gridColumn: column, gridRow: row } as CSSProperties}
  >
    <Anchor id={id}>{children}</Anchor>
  </div>
);

/** 표의 테두리. 실제 표는 칸의 border 로 그리지만, 필름이 따로 움직이도록 선 하나로 둔다 */
const GridLine = ({
  id,
  className,
  column,
  row,
}: {
  id: string;
  className: string;
  column: string | number;
  row: string | number;
}) => (
  <Anchor
    id={id}
    className={cn("bg-content-muted", className)}
    style={{ gridColumn: column, gridRow: row }}
  />
);

const FOOTER_ROW = DEMO_ROUTINES.length + 2;

/**
 * 주간 루틴 표 (RoutineTable). 필름의 달력 장면에서도 이 표를 재서 달력으로 접는다.
 * isChecked 로 어느 칸이 체크됐는지 받는다. 정적 화면이 장면마다 다른 상태를 보여 줄 때 쓴다.
 */
const RoutineWeekTable = ({ isChecked }: { isChecked: CellChecked }) => (
  <div className="grid min-w-85 grid-cols-[minmax(5.5rem,auto)_repeat(7,minmax(0,1fr))_auto] text-center">
    <GridCell id="th:label" column={1} row={1} className="px-2">
      <CellText>루틴</CellText>
    </GridCell>
    {DEMO_WEEK.map((date, weekday) => (
      <div
        key={date}
        className="flex h-12 flex-col items-center justify-center"
        style={{ gridColumn: weekday + 2, gridRow: 1 }}
      >
        <Anchor id={`hl:${weekday}`}>
          <WeekdayLabel weekday={weekday} label={WEEK_LABELS[weekday]} />
        </Anchor>
        <Anchor id={`hd:${weekday}`}>
          <WeekdayLabel weekday={weekday} label={String(date)} />
        </Anchor>
      </div>
    ))}
    <GridCell id="th:sum" column={9} row={1} className="px-2">
      <CellText>합계</CellText>
    </GridCell>

    {DEMO_ROUTINES.map((routine, index) => {
      const total = getRoutineRowTotal(routine, isChecked);
      return [
        <GridCell key="title" id={`title:${routine.id}`} column={1} row={index + 2} className="px-2">
          <TaskRowTitle className="text-sm">{routine.title}</TaskRowTitle>
        </GridCell>,
        ...DEMO_WEEK.map((date, weekday) => (
          <GridCell key={date} id={`cell:${routine.id}:${weekday}`} column={weekday + 2} row={index + 2}>
            {isScheduled(routine, weekday) ? (
              <CheckIcon
                color={DEMO_CATEGORIES[routine.category].color}
                checked={isChecked(routine, weekday)}
              />
            ) : (
              <DashIcon />
            )}
          </GridCell>
        )),
        <GridCell key="sum" id={`rsum:${routine.id}`} column={9} row={index + 2} className="px-2">
          <CellText>{`${total.done} / ${total.total}`}</CellText>
        </GridCell>,
      ];
    })}

    <GridCell id="tt:label" column={1} row={FOOTER_ROW} className="px-2">
      <CellText bold>합계</CellText>
    </GridCell>
    {DEMO_WEEK.map((date, weekday) => {
      const total = getWeekTotal(weekday, isChecked);
      return (
        <GridCell key={date} id={`tot:${weekday}`} column={weekday + 2} row={FOOTER_ROW}>
          <CellText className="text-xs text-content-muted">{`${total.done}/${total.total}`}</CellText>
        </GridCell>
      );
    })}
    <GridCell id="tt:sum" column={9} row={FOOTER_ROW} className="px-2">
      <CellText bold>
        {(() => {
          const sums = DEMO_WEEK.map((_, weekday) => getWeekTotal(weekday, isChecked));
          const done = sums.reduce((sum, item) => sum + item.done, 0);
          const total = sums.reduce((sum, item) => sum + item.total, 0);
          return `${done} / ${total}`;
        })()}
      </CellText>
    </GridCell>

    <GridLine id="line:head" className="h-px self-end" column="1 / span 9" row={1} />
    <GridLine id="line:foot" className="h-px self-start" column="1 / span 9" row={FOOTER_ROW} />
    <GridLine id="line:v1" className="w-px justify-self-end" column={1} row={`1 / span ${FOOTER_ROW}`} />
    <GridLine id="line:v2" className="w-px justify-self-start" column={9} row={`1 / span ${FOOTER_ROW}`} />
  </div>
);

/**
 * 할 일과 루틴이 갈라진 장면.
 * 한 번 할 일은 할 일 목록에 남고, 루틴은 옆(좁은 화면에서는 아래)으로 빠져 요일 칸으로 늘어난다.
 */
export const SplitFrame = ({
  mode,
  isChecked,
}: {
  mode: FrameMode;
  isChecked: CellChecked;
}) => (
  <FrameLayout
    id="split"
    mode={mode}
    caption={
      <Caption id="split" mode={mode}>
        {COPY.split}
      </Caption>
    }
  >
    <ScreenArea mode={mode} className="max-w-240">
      <AppHeaderAnchors />
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-10">
        <div>
          <SectionHead slot="task" title="할 일 목록" subTitle={getTaskSubTitle(DEMO_TODAY, 0, DEMO_TASKS.length)} />
          <Anchor id="cat" className="mt-2">
            <CategoryHeader
              name={DEMO_CATEGORIES.inbox.name}
              color={DEMO_CATEGORIES.inbox.color}
              count={`0 / ${DEMO_TASKS.length}`}
            />
          </Anchor>
          {DEMO_TASKS.map((task) => (
            <div key={task.id} className="flex items-start gap-2 py-1">
              <Anchor id={`icon:${task.id}`} className="mt-0.5">
                <CheckIcon color={DEMO_CATEGORIES.inbox.color} />
              </Anchor>
              <Anchor id={`title:${task.id}`}>
                <TaskRowTitle>{task.title}</TaskRowTitle>
              </Anchor>
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <SectionHead slot="main" title="루틴 목록" subTitle={WEEK_LABEL} />
          {/* 좁은 화면에서 페이지 전체가 가로로 밀리지 않도록 표만 스크롤시킨다 (RoutineTable 과 같다) */}
          <div className="relative mt-2 overflow-x-auto">
            <RoutineWeekTable isChecked={isChecked} />
          </div>
        </div>
      </div>
    </ScreenArea>
  </FrameLayout>
);

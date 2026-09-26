import type { CSSProperties, ReactNode } from "react";
import { WEEK_LABELS } from "@/shared/constants/dateLabels";
import { cn } from "@/shared/ui/primitives";
import { COPY, type CaptionId } from "../constants/copy";
import { CHECK_POINTS, CHECK_STROKE } from "../constants/checkShape";
import {
  DEMO_BAR_MAX,
  DEMO_CALENDAR,
  DEMO_CATEGORIES,
  DEMO_ITEMS,
  DEMO_MONTH,
  DEMO_RATE,
  DEMO_RATE_DELTA,
  DEMO_ROUTINES,
  DEMO_SUMMARY,
  DEMO_WEEK,
  DEMO_WEEK_ROWS,
  DEMO_WEEK_ROW_INDEX,
  isScheduled,
} from "../constants/demoData";
import { toPercent } from "@/shared/api/monthlyStats/helpers/summarizeRange";
import { MONTH_LABEL, WEEK_LABEL } from "../utils/storyLabels";
import { ACTOR_ITEM_ORDER, cellActor, dateActor, ringActor } from "../utils/buildTracks";
import { CheckIcon, DashIcon } from "./AppMock/CheckIcon";
import { TaskRowTitle } from "./AppMock/TaskRowTitle";
import { CategoryHeader } from "./AppMock/AddCategory";
import { SectionControls, SectionSubTitle, SectionTitle } from "./AppMock/TitleSection";
import { CellText, WeekdayLabel } from "./AppMock/RoutineTable";
import { CalendarDate, CalendarRing } from "./AppMock/CalendarCell";
import {
  DeltaView,
  LegendView,
  RateTextView,
  RateView,
  SplitRowView,
  WeekBar,
  WeekBarLabel,
} from "./AppMock/AchievementSummary";
import { LogoImage, Wordmark } from "./AppMock/Logo";
import { CaptionText } from "./Frames/FrameLayout";
import { LandingCta } from "./LandingCta";

/**
 * 필름의 배우. 무대 왼쪽 위에 겹쳐 두고, 위치와 크기는 엔진이 transform 으로만 바꾼다.
 * 배우의 겉모습은 프레임과 같은 AppMock 조각을 쓴다. 그래야 옮겨 간 자리에서 모양이 맞는다.
 */
const Actor = ({
  id,
  className,
  style,
  hidden = true,
  children,
}: {
  id: string;
  className?: string;
  style?: CSSProperties;
  /** 장식이면 화면 낭독기에서 뺀다. 문장과 버튼만 읽힌다 */
  hidden?: boolean;
  children?: ReactNode;
}) => (
  <div
    data-actor={id}
    aria-hidden={hidden || undefined}
    className={cn("pointer-events-none absolute top-0 left-0 invisible", className)}
    style={style}
  >
    {children}
  </div>
);

/** 여러 글자 중 하나만 보이는 배우. 같은 자리의 제목이 장면마다 다른 섹션 제목이 된다 */
const Variants = ({ items }: { items: ReactNode[] }) => (
  <div className="grid justify-items-start">
    {items.map((item, index) => (
      <div
        key={index}
        data-variant={index}
        className="col-start-1 row-start-1 transition-opacity duration-300 data-[active=false]:opacity-0"
        data-active={index === 0}
      >
        {item}
      </div>
    ))}
  </div>
);

/** 이야기의 체크. 세 점 모양은 엔진이 바꾼다 (가로선 ↔ 체크) */
const NarrativeCheck = () => (
  <svg viewBox="0 0 100 100" className="block h-[100px] w-[100px] overflow-visible">
    <polyline
      data-check-line=""
      points={CHECK_POINTS.map((point) => point.join(",")).join(" ")}
      pathLength={1}
      fill="none"
      strokeWidth={CHECK_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1 1"
      strokeDashoffset={1}
      style={{
        // 원 안에 있을 때는 체크 아이콘의 뚫린 자리(바탕색), 밖으로 나오면 글자색이다
        stroke: "color-mix(in srgb, var(--color-content) calc(var(--lift, 0) * 100%), var(--color-surface))",
      }}
    />
  </svg>
);

export const FilmActors = () => (
  <>
    {/* 달성 현황의 판은 다른 것보다 뒤에 깔린다 */}
    <Actor id="panel" className="rounded-xl bg-surface-sunken" />

    {/* 주간 표의 테두리 */}
    {["line:head", "line:foot", "line:v1", "line:v2"].map((id) => (
      <Actor key={id} id={id} className="bg-content-muted" />
    ))}

    {/* 휴대폰 테두리. 선이 그려지며 드러난다 */}
    <Actor id="phone">
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <rect
          data-phone-line=""
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="44"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1}
          fill="none"
          strokeWidth="2"
          className="stroke-content"
        />
      </svg>
    </Actor>

    {/* 머리 */}
    <Actor id="taskTitle">
      <SectionTitle>할 일 목록</SectionTitle>
    </Actor>
    <Actor id="taskSub">
      <SectionSubTitle>
        <span data-text="">{" "}</span>
      </SectionSubTitle>
    </Actor>
    <Actor id="taskCtl">
      <SectionControls />
    </Actor>
    <Actor id="cat">
      <CategoryHeader name={DEMO_CATEGORIES.inbox.name} color={DEMO_CATEGORIES.inbox.color} count={`1 / ${DEMO_ITEMS.length}`} />
    </Actor>
    <Actor id="mainTitle">
      <Variants
        items={["루틴 목록", "캘린더", "달성 현황"].map((title) => (
          <SectionTitle key={title}>{title}</SectionTitle>
        ))}
      />
    </Actor>
    <Actor id="mainSub">
      <Variants items={[WEEK_LABEL, MONTH_LABEL].map((label) => <SectionSubTitle key={label}>{label}</SectionSubTitle>)} />
    </Actor>
    <Actor id="mainCtl">
      <div className="grid justify-items-end">
        {(["nav", "mode"] as const).map((variant, index) => (
          <div
            key={variant}
            data-variant={index}
            data-active={index === 0}
            className="col-start-1 row-start-1 transition-opacity duration-300 data-[active=false]:opacity-0"
          >
            <SectionControls variant={variant} />
          </div>
        ))}
      </div>
    </Actor>

    {/* 주간 표 */}
    <Actor id="th:label">
      <CellText>루틴</CellText>
    </Actor>
    <Actor id="th:sum">
      <CellText>합계</CellText>
    </Actor>
    <Actor id="tt:label">
      <CellText bold>합계</CellText>
    </Actor>
    <Actor id="tt:sum">
      <CellText bold>
        <span data-text="" />
      </CellText>
    </Actor>
    {DEMO_ROUTINES.map((routine) => (
      <Actor key={routine.id} id={`rsum:${routine.id}`}>
        <CellText>
          <span data-text="" />
        </CellText>
      </Actor>
    ))}
    {WEEK_LABELS.map((label, weekday) => (
      <Actor key={label} id={`hl:${weekday}`}>
        <WeekdayLabel weekday={weekday} label={label} />
      </Actor>
    ))}

    {/* 달력: 링과 날짜. 이번 주 줄의 링은 주간 표 합계 칸에서, 날짜는 표 머리에서 온다 */}
    {DEMO_CALENDAR.map((week, row) =>
      week.map((slot) => {
        const isWeekRow = row === DEMO_WEEK_ROW_INDEX;
        return [
          <Actor
            key={`ring-${row}-${slot.weekday}`}
            id={ringActor(row, slot.weekday)}
            className="grid place-items-center"
            style={{ "--m": isWeekRow ? 0 : 1 } as CSSProperties}
          >
            <div className="col-start-1 row-start-1 opacity-(--m)">
              <CalendarRing inMonth={slot.inMonth} total={0} />
            </div>
            {isWeekRow && (
              <div className="col-start-1 row-start-1 opacity-[calc(1_-_var(--m))]">
                <CellText className="text-xs text-content-muted">
                  <span data-text="" />
                </CellText>
              </div>
            )}
          </Actor>,
          <Actor key={`date-${row}-${slot.weekday}`} id={dateActor(row, slot.weekday)}>
            {isWeekRow ? (
              <WeekdayLabel weekday={slot.weekday} label={String(DEMO_WEEK[slot.weekday])} />
            ) : (
              <CalendarDate day={slot.day} weekday={slot.weekday} inMonth={slot.inMonth} />
            )}
          </Actor>,
        ];
      }),
    )}

    {/* 요일 칸 (일요일 칸은 루틴 아이콘이 맡는다) */}
    {DEMO_ROUTINES.map((routine) =>
      DEMO_WEEK.slice(1).map((_, index) => {
        const weekday = index + 1;
        return (
          <Actor key={`${routine.id}-${weekday}`} id={cellActor(routine.id, weekday)}>
            {isScheduled(routine, weekday) ? (
              <CheckIcon color={DEMO_CATEGORIES[routine.category].color} />
            ) : (
              <DashIcon />
            )}
          </Actor>
        );
      }),
    )}

    {/* 할 일. 주인공이 맨 위에 오도록 거꾸로 그린다 */}
    {ACTOR_ITEM_ORDER.map((id) => {
      const item = DEMO_ITEMS.find((candidate) => candidate.id === id)!;
      return [
        <Actor key={`title-${id}`} id={`title:${id}`}>
          <span data-done="false" className="group block">
            <TaskRowTitle className="transition-opacity duration-300 group-data-[done=true]:line-through group-data-[done=true]:opacity-60">
              {item.title}
            </TaskRowTitle>
          </span>
        </Actor>,
        <Actor key={`icon-${id}`} id={`icon:${id}`}>
          <span data-pop="" className="block">
            <CheckIcon color={DEMO_CATEGORIES.inbox.color} className="transition-colors duration-500" />
          </span>
        </Actor>,
      ];
    })}

    {/* 달성 현황 */}
    {DEMO_WEEK_ROWS.map((row, index) => [
      <Actor key={`bar-${index}`} id={`bar:${index}`} className="flex items-center">
        <WeekBar completed={row.completed} total={row.total} max={DEMO_BAR_MAX} />
      </Actor>,
      <Actor key={`barLabel-${index}`} id={`barLabel:${index}`} className="text-[12.5px] whitespace-nowrap">
        <WeekBarLabel index={index} firstDay={row.firstDay} lastDay={row.lastDay} />
      </Actor>,
      <Actor key={`barPct-${index}`} id={`barPct:${index}`} className="text-[12.5px] text-content-muted">
        {`${toPercent(row.completed, row.total) ?? 0}%`}
      </Actor>,
    ])}
    <Actor id="rate">
      <RateView rate={DEMO_RATE} />
    </Actor>
    <Actor id="rateText">
      <RateTextView completed={DEMO_SUMMARY.completed} total={DEMO_SUMMARY.total} />
    </Actor>
    <Actor id="delta">
      <DeltaView month={DEMO_MONTH - 1} diff={DEMO_RATE_DELTA} />
    </Actor>
    <Actor id="split:task">
      <SplitRowView label="할 일" completed={DEMO_SUMMARY.taskCompleted} total={DEMO_SUMMARY.taskTotal} />
    </Actor>
    <Actor id="split:routine">
      <SplitRowView label="루틴" completed={DEMO_SUMMARY.routineCompleted} total={DEMO_SUMMARY.routineTotal} />
    </Actor>
    <Actor id="legend">
      <LegendView />
    </Actor>

    {/* 캐릭터와 워드마크. 앱 머리에서는 원 없는 로고로 바뀐다 */}
    <Actor id="char" className="h-[100px] w-[100px]">
      <div className="absolute inset-0 opacity-[calc(1_-_var(--plain,0))]">
        <LogoImage shape="round" />
      </div>
      <div className="absolute inset-0 opacity-(--plain,0)">
        <LogoImage shape="plain" className="object-contain" />
      </div>
    </Actor>
    <Actor id="mark">
      <Wordmark className="text-2xl" />
    </Actor>

    {/* 이야기의 체크는 캐릭터 위에 겹친다 */}
    <Actor id="check">
      <NarrativeCheck />
    </Actor>
  </>
);

/** 무대 위(카메라와 무관한 층)의 배우. 문장과 버튼이다 */
export const FilmHud = ({ onHeroCheck }: { onHeroCheck: () => void }) => {
  const captions: CaptionId[] = ["question", "tryCheck", "list", "split", "calendar", "stats", "zero", "done"];
  return (
    <>
      {captions.map((id) => (
        <Actor key={id} id={`cap:${id}`} hidden={false} className="text-center">
          <CaptionText>{COPY[id]}</CaptionText>
        </Actor>
      ))}
      <Actor id="slogan" hidden={false}>
        <p className="text-base whitespace-nowrap">{COPY.slogan}</p>
      </Actor>
      <Actor id="hit" hidden={false} className="pointer-events-auto">
        <button
          type="button"
          data-hit=""
          aria-pressed={false}
          aria-label="물 한 잔 마시기 체크하기"
          onClick={onHeroCheck}
          className="h-full w-full cursor-pointer rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        />
      </Actor>
      <Actor id="cta" hidden={false} className="pointer-events-auto w-80 max-w-[calc(100vw_-_3rem)]">
        <LandingCta />
      </Actor>
    </>
  );
};

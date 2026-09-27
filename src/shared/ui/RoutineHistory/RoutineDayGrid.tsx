import { Fragment, type CSSProperties } from "react";
import type { RoutineDay, RoutineDayStatus } from "@/shared/api/routine";
import { WEEK_LABELS, getWeekendTextClass } from "@/shared/constants/dateLabels";
import { cn } from "@/shared/ui/cn";

const STATUS_LABEL: Record<RoutineDayStatus, string> = {
  done: "했음",
  missed: "못 함",
  off: "쉬는 날",
  upcoming: "예정",
  outside: "",
};

/** 한 칸의 생김새. 했음만 채우고, 못 함은 테두리로만 그려 색 없이도 둘을 가른다 */
const cellClass = (status: RoutineDayStatus) => {
  switch (status) {
    case "missed":
      return "border-[1.5px] border-dashed";
    case "off":
      return "bg-surface-sunken";
    case "upcoming":
      return "border-[1.5px] border-dotted border-line";
    default:
      return "";
  }
};

const formatMonthDay = (ymd: string) =>
  `${Number(ymd.slice(5, 7))}월 ${Number(ymd.slice(8, 10))}일`;

/**
 * 루틴 하나의 수행 달력. 한 줄이 요일, 한 칸이 하루, 한 열이 한 주다.
 *
 * days 는 일요일에서 시작해 토요일에서 끝나야 한다(getRoutineHistoryRange 가 그렇게 자른다).
 */
export const RoutineDayGrid = ({
  days,
  todayYmd,
  fillColor,
  lineColor,
}: {
  days: RoutineDay[];
  todayYmd: string;
  /** 했음 칸을 채울 색 (카테고리 색) */
  fillColor: string;
  /** 못 함 칸의 테두리 색 (카테고리 글자색) */
  lineColor: string;
}) => {
  const weeks = Math.ceil(days.length / 7);

  // 달이 바뀌는 주의 열 위에 그 달을 적는다. 첫 열에도 적되,
  // 바로 다음 열에서 달이 바뀌면 두 이름이 붙어 읽히지 않으므로 건너뛴다
  const isMonthStartIn = (week: number) =>
    days.slice(week * 7, week * 7 + 7).some((day) => day.date.endsWith("-01"));
  const columns = Array.from({ length: weeks }, (_, week) => {
    const weekDays = days.slice(week * 7, week * 7 + 7);
    const firstOfMonth = weekDays.find((day) => day.date.endsWith("-01"));
    const labelDay =
      firstOfMonth ?? (week === 0 && !isMonthStartIn(1) ? weekDays[0] : undefined);
    return {
      key: weekDays[0]?.date ?? String(week),
      monthLabel: labelDay ? `${Number(labelDay.date.slice(5, 7))}월` : "",
      days: weekDays,
    };
  });

  return (
    <div className="flex flex-col gap-2">
      {/* 첫 줄은 달 이름, 첫 열은 요일 이름이다. 한 격자에 두어야 칸 높이와 요일 글자가 맞는다 */}
      <div
        className="grid grid-flow-col grid-rows-8 items-center gap-1 text-[11px] text-content-muted"
        style={{
          gridTemplateColumns: `auto repeat(${weeks}, minmax(0, 1fr))`,
          maxWidth: 24 + weeks * 30,
        }}
      >
        <span aria-hidden="true" />
        {WEEK_LABELS.map((label, day) => (
          <span key={label} className={cn("pr-0.5", getWeekendTextClass(day))}>
            {label}
          </span>
        ))}

        {columns.map((column) => (
          <Fragment key={column.key}>
            <span className="whitespace-nowrap">{column.monthLabel}</span>
            {column.days.map((day) => {
              const label = STATUS_LABEL[day.status]
                ? `${formatMonthDay(day.date)} ${STATUS_LABEL[day.status]}`
                : undefined;
              return (
                <span
                  key={day.date}
                  role={label ? "img" : undefined}
                  title={label}
                  aria-label={label}
                  aria-hidden={label ? undefined : true}
                  className={cn(
                    "aspect-square rounded-[5px]",
                    cellClass(day.status),
                    day.date === todayYmd &&
                      "outline-2 outline-offset-1 outline-line-strong",
                  )}
                  style={
                    day.status === "done"
                      ? { backgroundColor: fillColor }
                      : day.status === "missed"
                        ? { borderColor: lineColor }
                        : undefined
                  }
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-content-muted">
        <LegendItem label="했음" style={{ backgroundColor: fillColor }} />
        <LegendItem
          label="못 함"
          className="border-[1.5px] border-dashed"
          style={{ borderColor: lineColor }}
        />
        <LegendItem label="쉬는 날" className="bg-surface-sunken" />
        <LegendItem label="예정" className="border-[1.5px] border-dotted border-line" />
      </div>
    </div>
  );
};

const LegendItem = ({
  label,
  className,
  style,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
}) => (
  <span className="flex items-center gap-1">
    <span
      aria-hidden="true"
      className={cn("size-2.5 rounded-[3px]", className)}
      style={style}
    />
    {label}
  </span>
);

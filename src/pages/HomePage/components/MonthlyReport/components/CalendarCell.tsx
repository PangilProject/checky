import { Text } from "@/shared/ui/primitives";
import {
  SATURDAY_TEXT_CLASS,
  SUNDAY_TEXT_CLASS,
} from "@/shared/constants/colors";
import type { CalendarDateCell } from "@/shared/hooks/calendar/useCalendar";
import type { MonthlyActivityCount } from "@/shared/hooks/calendar/types";

const RING_RADIUS = 13.5;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface CalendarCellProps {
  cell: CalendarDateCell;
  index: number;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  activity: MonthlyActivityCount | undefined;
}

export function CalendarCell({
  cell,
  index,
  selectedDate,
  setSelectedDate,
  activity,
}: CalendarCellProps) {
  const { date, isCurrentMonth } = cell;
  const day = date.getDate();

  // 요일 계산
  const dayOfWeek = index % 7;

  const textColor = !isCurrentMonth
    ? "text-content-muted"
    : dayOfWeek === 0
      ? SUNDAY_TEXT_CLASS
      : dayOfWeek === 6
        ? SATURDAY_TEXT_CLASS
        : "";

  // 선택된 날짜 여부
  const isSelected =
    selectedDate.getFullYear() === date.getFullYear() &&
    selectedDate.getMonth() === date.getMonth() &&
    selectedDate.getDate() === day;

  return (
    <button
      onClick={() => setSelectedDate(new Date(date))}
      className={`
        w-[14.285%] h-15 flex flex-col items-center justify-center gap-1
        ${isSelected ? "bg-surface-selected" : "hover:bg-surface-hover"}
      `}
    >
      {/* 남은 개수와 완료 비율 링.
          남은 개수만으로는 "10개 중 2개 남음"과 "3개 중 2개 남음"이 똑같아 보여 링으로 비율을 더한다 */}
      <div className="relative flex h-7.5 w-7.5 items-center justify-center">
        {activity && isCurrentMonth ? (
          <>
            <svg
              viewBox="0 0 30 30"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <circle
                cx="15"
                cy="15"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="2"
                className="stroke-line"
              />
              {activity.total > 0 && activity.completed > 0 && (
                <circle
                  cx="15"
                  cy="15"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    (RING_LENGTH * Math.min(activity.completed, activity.total)) /
                    activity.total
                  } ${RING_LENGTH}`}
                  transform="rotate(-90 15 15)"
                  className={
                    activity.remaining === 0 ? "stroke-success" : "stroke-primary"
                  }
                />
              )}
            </svg>
            <div
              className={`
                relative w-6 h-6 flex items-center justify-center rounded-full
                text-xs font-bold
                ${
                  activity.remaining === 0
                    ? "bg-success text-on-success"
                    : "bg-line text-content"
                }
              `}
            >
              {activity.remaining}
            </div>
          </>
        ) : (
          <div
            className={`w-6 h-6 rounded-full ${isCurrentMonth ? "bg-line" : "bg-surface-sunken"}`}
          />
        )}
      </div>

      {/* 날짜 */}
      <Text variant="caption" className={textColor}>
        {String(day)}
      </Text>
    </button>
  );
}

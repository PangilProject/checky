import { Text } from "@/shared/ui/primitives";
import {
  SATURDAY_TEXT_CLASS,
  SUNDAY_TEXT_CLASS,
} from "@/shared/constants/colors";
import type { CalendarDateCell } from "@/shared/hooks/calendar/useCalendar";

interface CalendarCellProps {
  cell: CalendarDateCell;
  index: number;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  activity: { remaining: number } | undefined;
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
        ${isSelected ? "bg-surface-sunken" : isCurrentMonth ? "hover:bg-surface-sunken" : "hover:bg-surface-sunken"}
      `}
    >
      {/* 태스크 개수 */}
      {activity && isCurrentMonth ? (
        <div
          className={`
            w-6 h-6 flex items-center justify-center rounded-full
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
      ) : (
        <div
          className={`w-6 h-6 rounded-full ${isCurrentMonth ? "bg-line" : "bg-surface-sunken"}`}
        />
      )}

      {/* 날짜 */}
      <Text variant="caption" className={textColor}>
        {String(day)}
      </Text>
    </button>
  );
}

import { Text1 } from "@/shared/ui/Text";
import { SATURDAY_COLOR, SUNDAY_COLOR } from "@/shared/constants/colors";
import type { CalendarDateCell } from "@/shared/hooks/calendar/useCalendar";
import type { CSSProperties } from "react";

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

  const textColor =
    !isCurrentMonth
      ? "text-gray-400"
      : dayOfWeek === 0
        ? "text-[var(--sun-color)]"
        : dayOfWeek === 6
          ? "text-[var(--sat-color)]"
          : "";

  // 선택된 날짜 여부
  const isSelected =
    selectedDate.getFullYear() === date.getFullYear() &&
    selectedDate.getMonth() === date.getMonth() &&
    selectedDate.getDate() === day;

  return (
    <button
      onClick={() => setSelectedDate(new Date(date))}
      style={
        {
          "--sun-color": SUNDAY_COLOR,
          "--sat-color": SATURDAY_COLOR,
        } as CSSProperties
      }
      className={`
        w-[14.285%] h-15 flex flex-col items-center justify-center gap-1
        ${isSelected ? "bg-gray-100" : isCurrentMonth ? "hover:bg-gray-100" : "hover:bg-gray-50"}
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
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-black"
            }
          `}
        >
          {activity.remaining}
        </div>
      ) : (
        <div
          className={`w-6 h-6 rounded-full ${isCurrentMonth ? "bg-gray-200" : "bg-gray-100"}`}
        />
      )}

      {/* 날짜 */}
      <Text1 text={String(day)} className={textColor} />
    </button>
  );
}

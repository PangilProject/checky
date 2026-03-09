import { Text1 } from "@/shared/ui/Text";
import { SATURDAY_COLOR, SUNDAY_COLOR } from "@/shared/constants/color";

interface CalendarCellProps {
  day: number | null;
  index: number;
  year: number;
  month: number;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  activity: { remaining: number } | undefined;
}

export function CalendarCell({
  day,
  index,
  year,
  month,
  selectedDate,
  setSelectedDate,
  activity,
}: CalendarCellProps) {
  // 현재 달에 속하지 않는 날짜
  if (day === null) {
    return <div className="w-[14.285%] h-15" />;
  }

  // 요일 계산
  const dayOfWeek = index % 7;

  // 요일 색상
  const dateColor =
    dayOfWeek === 0
      ? SUNDAY_COLOR
      : dayOfWeek === 6
        ? SATURDAY_COLOR
        : undefined;

  const textColor = `text-[${dateColor}]`;

  // 선택된 날짜 여부
  const isSelected =
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === day;

  return (
    <button
      onClick={() => setSelectedDate(new Date(year, month, day))}
      className={`
        w-[14.285%] h-15 flex flex-col items-center justify-center gap-1
        ${isSelected ? "bg-gray-100" : "hover:bg-gray-100"}
      `}
    >
      {/* 태스크 개수 */}
      {activity ? (
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
        <div className="w-6 h-6 bg-gray-200 rounded-full" />
      )}

      {/* 날짜 */}
      <Text1 text={String(day)} className={textColor} />
    </button>
  );
}

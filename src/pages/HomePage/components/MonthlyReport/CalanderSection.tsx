import { useCalendar } from "@/shared/hooks/calendar";
import { useSelectedDate } from "@/shared/contexts/DateContext";
import { FaCheckCircle } from "react-icons/fa";
import { LuCircleDashed } from "react-icons/lu";
import { Text1, Text2 } from "@/shared/ui/Text";

const SUNDAY_COLOR = "#FF393C";
const SATURDAY_COLOR = "#0088FF";

export const CalanderSection = ({
  activityMap,
}: {
  activityMap: Map<string, boolean>;
}) => {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const { year, month, cells } = useCalendar(selectedDate);

  return (
    <div className="w-full">
      {/* 요일 헤더 */}
      <div className="flex w-full border-b border-[#8E8E93]">
        {["일", "월", "화", "수", "목", "금", "토"].map((d, index) => {
          const color =
            index === 0
              ? SUNDAY_COLOR
              : index === 6
              ? SATURDAY_COLOR
              : undefined;

          return (
            <div
              key={d}
              className="w-[14.285%] text-center font-medium py-2"
              style={{ color }}
            >
              <Text2 text={d} />
            </div>
          );
        })}
      </div>

      {/* 날짜 영역 */}
      <div className="flex flex-wrap w-full">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={index} className="w-[14.285%] h-15" />;
          }

          // ⭐ 해당 날짜의 요일 계산
          const dayOfWeek = index % 7; // 0: 일 ~ 6: 토
          const dateColor =
            dayOfWeek === 0
              ? SUNDAY_COLOR
              : dayOfWeek === 6
              ? SATURDAY_COLOR
              : undefined;

          const dateKey = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          const hasActivity = activityMap.get(dateKey);
          const isSelected =
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === day;

          const textColor = `text-[${dateColor}]`;
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(new Date(year, month, day))}
              className={`
                w-[14.285%] h-15 flex flex-col items-center justify-center gap-1
                ${isSelected ? "bg-gray-100" : ""}
              `}
            >
              {hasActivity ? (
                <FaCheckCircle size={20} />
              ) : (
                <LuCircleDashed size={20} />
              )}
              <Text1 text={String(day)} className={textColor} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

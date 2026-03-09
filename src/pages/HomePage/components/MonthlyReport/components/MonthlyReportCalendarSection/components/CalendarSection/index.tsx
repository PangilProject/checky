import { CalendarHeader } from "./CalendarHeader";
import { CalendarBody } from "./CalendarBody";

export const CalanderSection = () => {
  return (
    <div className="w-full">
      {/* 1. 요일 헤더 */}
      <CalendarHeader />

      {/* 2. 날짜 영역 */}
      <CalendarBody />
    </div>
  );
};

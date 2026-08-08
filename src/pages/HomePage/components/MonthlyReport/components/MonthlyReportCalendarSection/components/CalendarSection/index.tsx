import type { MonthlyData } from "@/shared/hooks/calendar";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarBody } from "./CalendarBody";

export const CalanderSection = ({
  monthlyData,
}: {
  monthlyData: MonthlyData;
}) => {
  return (
    <div className="w-full">
      {/* 1. 요일 헤더 */}
      <CalendarHeader />

      {/* 2. 날짜 영역 */}
      <CalendarBody monthlyData={monthlyData} />
    </div>
  );
};

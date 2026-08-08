import type { MonthlyData } from "@/shared/hooks/calendar";
import { CalanderSection } from "./components/CalendarSection";
import { MonthlyReportSkeleton } from "./components/MonthlyReportSkeleton";

export function MonthlyReportCalendarSection({
  monthlyData,
}: {
  monthlyData: MonthlyData;
}) {
  return (
    <>
      {monthlyData.isLoading ? (
        // 2-1. 로딩 스켈레톤
        <MonthlyReportSkeleton />
      ) : (
        // 2-2. 캘린더
        <CalanderSection monthlyData={monthlyData} />
      )}
    </>
  );
}

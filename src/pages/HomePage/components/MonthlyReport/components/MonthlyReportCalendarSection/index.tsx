import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { CalanderSection } from "./components/CalendarSection";
import { MonthlyReportSkeleton } from "./components/MonthlyReportSkeleton";
import { useMonthlyData } from "@/shared/hooks/calendar";

export function MonthlyReportCalendarSection() {
  // 날짜 선택 상태 가져오기
  const { selectedDate } = useSelectedDate();
  // 로딩 상태 가져오기
  const { isLoading } = useMonthlyData(selectedDate);

  return (
    <>
      {isLoading ? (
        // 2-1. 로딩 스켈레톤
        <MonthlyReportSkeleton />
      ) : (
        // 2-2. 캘린더
        <CalanderSection />
      )}
    </>
  );
}

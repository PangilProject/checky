import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { useMonthlyData } from "@/shared/hooks/calendar";
import { CalendarBody } from "./components/CalendarBody";
import { CalendarHeader } from "./components/CalendarHeader";
import { MonthlyReportSkeleton } from "./components/MonthlyReportSkeleton";
import { MonthlyReportTitleSection } from "./components/MonthlyReportTitleSection";

/**
 * 월간 리포트 섹션
 *
 * useMonthlyData는 fallback upsert 부수효과가 있어 여기서 한 번만 호출하고,
 * 하위 컴포넌트에는 props로 내린다. (여러 곳에서 호출하면 중복 write 발생)
 *
 * 달력을 실제로 쓰는 것은 CalendarBody 하나뿐이라, monthlyData 를 그대로
 * 통과시키기만 하던 중간 래퍼는 두지 않는다.
 */
function MonthlyReportSection() {
  const { selectedDate } = useSelectedDate();
  const monthlyData = useMonthlyData(selectedDate);

  return (
    <div className="w-full flex flex-col">
      {/* 1. 타이틀 섹션 */}
      <MonthlyReportTitleSection refresh={monthlyData.refresh} />

      {/* 2. 캘린더 섹션 */}
      {monthlyData.isLoading ? (
        <MonthlyReportSkeleton />
      ) : (
        <div className="w-full">
          <CalendarHeader />
          <CalendarBody monthlyData={monthlyData} />
        </div>
      )}
    </div>
  );
}

export default MonthlyReportSection;

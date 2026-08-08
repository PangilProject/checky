import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { useMonthlyData } from "@/shared/hooks/calendar";
import { MonthlyReportCalendarSection } from "./components/MonthlyReportCalendarSection";
import { MonthlyReportTitleSection } from "./components/MonthlyReportTitleSection";

/**
 * 월간 리포트 섹션
 *
 * useMonthlyData는 fallback upsert 부수효과가 있어 여기서 한 번만 호출하고,
 * 하위 컴포넌트에는 props로 내린다. (여러 곳에서 호출하면 중복 write 발생)
 * @returns {JSX.Element}
 */
function MonthlyReportSection() {
  const { selectedDate } = useSelectedDate();
  const monthlyData = useMonthlyData(selectedDate);

  return (
    <div className="w-full flex flex-col">
      {/* 1. 타이틀 섹션 */}
      <MonthlyReportTitleSection refresh={monthlyData.refresh} />

      {/* 2. 캘린더 섹션 */}
      <MonthlyReportCalendarSection monthlyData={monthlyData} />
    </div>
  );
}

export default MonthlyReportSection;

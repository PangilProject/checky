import { MonthlyReportCalendarSection } from "./components/MonthlyReportCalendarSection";
import { MonthlyReportTitleSection } from "./components/MonthlyReportTitleSection";

/**
 * 월간 리포트 섹션
 * @returns {JSX.Element}
 */
function MonthlyReportSection() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. 타이틀 섹션 */}
      <MonthlyReportTitleSection />

      {/* 2. 캘린더 섹션 */}
      <MonthlyReportCalendarSection />
    </div>
  );
}

export default MonthlyReportSection;

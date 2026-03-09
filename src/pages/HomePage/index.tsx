import { Space20 } from "@/shared/ui/Space.tsx";
import MonthlyReportSection from "./components/MonthlyReport/index.tsx";
import RoutineReportSection from "./components/RoutineReport/RoutineReportSection.tsx";
import TaskReportSection from "./components/TaskReport/TaskReportSection.tsx";
import { DateProvider } from "@/shared/contexts/DateContext.tsx";

/**
 * HomePage 컴포넌트
 * 날짜 상태 관리를 위해 DateProvider로 감싸져 있습니다.
 */
function HomePage() {
  return (
    <DateProvider>
      <div>
        {/* 1. 월간 리포트 */}
        <MonthlyReportSection /> 
        <Space20 direction="mb" />

        {/* 2. 루틴 리포트 */}
        <RoutineReportSection />
        <Space20 direction="mb" />
        
        {/* 3. 할 일 리포트 */}
        <TaskReportSection />
      </div>
    </DateProvider>
  );
}

export default HomePage;

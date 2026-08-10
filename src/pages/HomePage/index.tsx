import MonthlyReportSection from "./components/MonthlyReport/index.tsx";
import RoutineReportSection from "./components/RoutineReport/index.tsx";
import TaskReportSection from "./components/TaskReport/sections/TaskReportSection.tsx";
import { SelectedDateProvider } from "@/shared/contexts/SelectedDateProvider";

/**
 * HomePage 컴포넌트
 * 날짜 상태 관리를 위해 SelectedDateProvider로 감싸져 있습니다.
 */
function HomePage() {
  return (
    <SelectedDateProvider>
      <div className="flex flex-col gap-20">
        {/* 1. 월간 리포트 */}
        <MonthlyReportSection />

        {/* 2. 루틴 리포트 */}
        <RoutineReportSection />

        {/* 3. 할 일 리포트 */}
        <TaskReportSection />
      </div>
    </SelectedDateProvider>
  );
}

export default HomePage;

import { Space20 } from "@/shared/ui/Space.tsx";
import MonthlyReportSection from "./components/MonthlyReport/MonthlyReportSection.tsx";
import RoutineReportSection from "./components/RoutineReport/RoutineReportSection.tsx";
import TaskReportSection from "./components/TaskReport/TaskReportSection.tsx";
import { DateProvider } from "@/shared/contexts/DateContext.tsx";

function HomePage() {
  return (
    <DateProvider>
      <div>
        <MonthlyReportSection />
        <Space20 direction="mb" />
        <RoutineReportSection />
        <Space20 direction="mb" />
        <TaskReportSection />
      </div>
    </DateProvider>
  );
}

export default HomePage;

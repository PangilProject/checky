import { Space20 } from "@/shared/ui/Space.tsx";
import MonthlyReportSection from "./components/MonthlyReport/MonthlyReportSection.tsx";
import RoutineReportSection from "./components/RoutineReport/RoutineReportSection.tsx";
import TaskReportSection from "./components/TaskReport/TaskReportSection.tsx";

function HomePage() {
  return (
    <div>
      <MonthlyReportSection />
      <Space20 direction="mb" />
      <RoutineReportSection />
      <Space20 direction="mb" />
      <TaskReportSection />
    </div>
  );
}

export default HomePage;

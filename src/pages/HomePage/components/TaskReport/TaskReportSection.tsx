import TitleSection from "../TitleSection";
import { TaskListSection } from "./TaskList";

function TaskReportSection() {
  const dateRange = "2026년 01월 04일";
  return (
    <div>
      <TitleSection title="Task Report" subTitle={dateRange} />
      <TaskListSection />
    </div>
  );
}
export default TaskReportSection;

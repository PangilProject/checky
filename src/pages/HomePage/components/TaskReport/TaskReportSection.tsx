import TitleSection from "../TitleSection";
import { TaskList } from "./TaskList";

function TaskReportSection() {
  const dateRange = "2026년 01월 04일";
  return (
    <div>
      <TitleSection title="Task Report" subTitle={dateRange} />
      <TaskList />
    </div>
  );
}
export default TaskReportSection;

import TitleSection from "../TitleSection";
import { TaskListSection } from "./TaskList";
import { useSelectedDate } from "@/shared/contexts/DateContext";

function TaskReportSection() {
  const { selectedDate } = useSelectedDate();

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월 ${selectedDate.getDate()}일`;

  return (
    <div>
      <TitleSection title="Task Report" subTitle={label} />
      <TaskListSection />
    </div>
  );
}

export default TaskReportSection;

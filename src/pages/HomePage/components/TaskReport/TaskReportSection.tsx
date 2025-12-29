import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/DateContext";
import { moveDay } from "@/shared/hooks/dateNavigation";
import { TaskListSection } from "./TaskList";
import { Space24 } from "@/shared/ui/Space";

function TaskReportSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월 ${selectedDate.getDate()}일`;

  return (
    <div>
      <TitleSection
        title="Task Report"
        subTitle={label}
        leftOnClick={() => setSelectedDate(moveDay(selectedDate, -1))}
        rightOnClick={() => setSelectedDate(moveDay(selectedDate, 1))}
      />
      <TaskListSection />
      <Space24 direction="mb" />
    </div>
  );
}

export default TaskReportSection;

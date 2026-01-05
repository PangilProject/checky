import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/DateContext";
import { moveMonth } from "@/shared/hooks/dateNavigation";
import { CalanderSection } from "./CalanderSection";
import { useMonthlyActivityCountMap } from "@/shared/hooks/calendar";

import { useMonthlyData } from "@/shared/hooks/calendar";

function MonthlyReportSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월`;

  const { tasks, taskLogs, routines, routineLogs } =
    useMonthlyData(selectedDate);

  const activityMap = useMonthlyActivityCountMap({
    date: selectedDate, // ⭐ 반드시 전달
    tasks,
    taskLogs,
    routines,
    routineLogs,
  });

  return (
    <div className="w-full flex flex-col">
      <TitleSection
        title="캘린더"
        subTitle={label}
        leftOnClick={() => setSelectedDate(moveMonth(selectedDate, -1))}
        rightOnClick={() => setSelectedDate(moveMonth(selectedDate, 1))}
      />
      <CalanderSection activityMap={activityMap} />
    </div>
  );
}

export default MonthlyReportSection;

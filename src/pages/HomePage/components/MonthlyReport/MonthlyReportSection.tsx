import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { moveMonth } from "@/shared/hooks/dateNavigation";
import { CalanderSection } from "./CalanderSection";
import { useMonthlyActivityCountMap } from "@/shared/hooks/calendar";

import { useMonthlyData } from "@/shared/hooks/calendar";
import { MonthlyReportSkeleton } from "./MonthlyReportSkeleton";

function MonthlyReportSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월`;

  const {
    monthKey,
    monthlyStatsDays,
    tasks,
    taskLogs,
    routines,
    routineLogs,
    isLoading,
    refresh,
  } =
    useMonthlyData(selectedDate);

  const activityMap = useMonthlyActivityCountMap({
    date: selectedDate,
    monthKey,
    monthlyStatsDays,
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
        onTodayClick={() => setSelectedDate(new Date())}
        onRefreshClick={() => {
          void refresh();
        }}
      />
      {isLoading ? (
        <MonthlyReportSkeleton />
      ) : (
        <CalanderSection activityMap={activityMap} />
      )}
    </div>
  );
}

export default MonthlyReportSection;

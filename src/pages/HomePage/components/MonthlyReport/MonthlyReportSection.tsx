import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/DateContext";
import { moveMonth } from "@/shared/hooks/dateNavigation";

function MonthlyReportSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월`;

  return (
    <TitleSection
      title="Monthly Report"
      subTitle={label}
      leftOnClick={() => setSelectedDate(moveMonth(selectedDate, -1))}
      rightOnClick={() => setSelectedDate(moveMonth(selectedDate, 1))}
    />
  );
}

export default MonthlyReportSection;

import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/DateContext";

function MonthlyReportSection() {
  const { selectedDate } = useSelectedDate();

  const label = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월`;

  return <TitleSection title="Monthly Report" subTitle={label} />;
}

export default MonthlyReportSection;

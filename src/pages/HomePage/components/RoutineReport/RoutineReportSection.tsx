import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/DateContext";
import { moveWeek } from "@/shared/hooks/dateNavigation";
import { Space24 } from "@/shared/ui/Space";
import { RoutineTable } from "./RoutineTable";

function RoutineReportSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const start = new Date(selectedDate);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const label = `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
    end.getMonth() + 1
  }월 ${end.getDate()}일`;

  return (
    <div>
      <TitleSection
        title="Routine Report"
        subTitle={label}
        leftOnClick={() => setSelectedDate(moveWeek(selectedDate, -1))}
        rightOnClick={() => setSelectedDate(moveWeek(selectedDate, 1))}
      />
      <RoutineTable />
      <Space24 direction="mb" />
    </div>
  );
}

export default RoutineReportSection;

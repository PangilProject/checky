import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/DateContext";

function RoutineReportSection() {
  const { selectedDate } = useSelectedDate();

  // 주간 범위 계산 (일요일 시작 예시)
  const start = new Date(selectedDate);
  start.setDate(selectedDate.getDate() - selectedDate.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const label = `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
    end.getMonth() + 1
  }월 ${end.getDate()}일`;

  return <TitleSection title="Routine Report" subTitle={label} />;
}

export default RoutineReportSection;

import { moveMonth } from "@/shared/hooks/dateNavigation";
import TitleSection from "../../TitleSection";
import { getMonthLabel } from "../utils/getMonthLabel";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { useMonthlyData } from "@/shared/hooks/calendar";

/**

 * @returns 
 */
export function MonthlyReportTitleSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  // 캘린더 헤더에 표시할 월 정보 생성
  const label = getMonthLabel(selectedDate);
  const { refresh } = useMonthlyData(selectedDate);
  return (
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
  );
}

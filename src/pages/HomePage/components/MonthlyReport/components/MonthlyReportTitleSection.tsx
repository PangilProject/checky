import { moveMonth } from "@/shared/hooks/dateNavigation";
import TitleSection from "../../TitleSection";
import { getMonthLabel } from "../utils/getMonthLabel";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";

/**
 * 캘린더 타이틀(월 이동/오늘/새로고침) 섹션.
 * 월간 데이터 갱신 함수는 상위(MonthlyReportSection)에서 내려받는다.
 */
export function MonthlyReportTitleSection({
  refresh,
}: {
  refresh: () => Promise<void>;
}) {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  // 캘린더 헤더에 표시할 월 정보 생성
  const label = getMonthLabel(selectedDate);
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

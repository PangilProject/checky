import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import {
  useCalendar,
  useMonthlyActivityCountMap,
  useMonthlyData,
} from "@/shared/hooks/calendar";
import { CalendarCell } from "./CalendarCell";

/**
 * 월간 리포트 캘린더 본문(날짜 셀 그리드)을 렌더링합니다.
 * 현재 선택 날짜 기준으로 달력 셀 목록을 구성하고,
 * 월별 태스크/루틴 데이터를 집계한 활동 수를 날짜별로 매핑해 각 셀에 전달합니다.
 */
export function CalendarBody() {
  // 현재 선택 날짜와 선택 날짜 업데이트 함수를 가져오기
  const { selectedDate, setSelectedDate } = useSelectedDate();

  // 선택 날짜를 기준으로 년/월/달력 셀 배열을 계산하기
  const { year, month, cells } = useCalendar(selectedDate);

  // 월간 리포트 집계에 필요한 원본 데이터를 가져오기
  const { monthKey, monthlyStatsDays, tasks, taskLogs, routines, routineLogs } =
    useMonthlyData(selectedDate);

  // 날짜별 활동 수 맵(Map<dateKey, activity>)을 생성
  const activityMap = useMonthlyActivityCountMap({
    date: selectedDate,
    monthKey,
    monthlyStatsDays,
    tasks,
    taskLogs,
    routines,
    routineLogs,
  });

  // 달력 본문(날짜 셀 그리드)을 렌더링
  return (
    // 셀들을 줄바꿈 가능한 가로 배치로 출력
    <div className="flex flex-wrap w-full">
      {/* 계산된 셀 배열을 순회하며 날짜 셀 컴포넌트를 렌더링 */}
      {cells.map((day, index) => {
        // YYYY-MM-DD 형식의 날짜 키를 생성
        const dateKey = `${year}-${String(month + 1).padStart(
          2,
          "0",
        )}-${String(day).padStart(2, "0")}`;

        // 해당 날짜의 활동 수 정보를 조회
        const activity = activityMap.get(dateKey);

        // 개별 날짜 셀 컴포넌트를 반환
        return (
          <CalendarCell
            key={index}
            day={day}
            index={index}
            year={year}
            month={month}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            activity={activity}
          />
        );
      })}
    </div>
  );
}

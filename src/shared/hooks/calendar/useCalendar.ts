import { useMemo } from "react";

/**
 * 월 달력 메타 정보를 계산합니다. (연/월/일수/시작 요일)
 */
export const getMonthInfo = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    year,
    month, // 0-based
    daysInMonth: lastDay.getDate(),
    startDay: firstDay.getDay(), // 0(일) ~ 6(토)
  };
};

/**
 * 달력 렌더링용 셀 배열(월별 필요 주 수 x 7일)을 생성합니다.
 */
export interface CalendarDateCell {
  date: Date;
  isCurrentMonth: boolean;
}

export const useCalendar = (selectedDate: Date) => {
  const { year, month, daysInMonth, startDay } = useMemo(
    () => getMonthInfo(selectedDate),
    [selectedDate],
  );

  const cells: CalendarDateCell[] = [];
  const firstDateOfMonth = new Date(year, month, 1);
  const startDate = new Date(firstDateOfMonth);
  startDate.setDate(firstDateOfMonth.getDate() - startDay);
  const totalCells = startDay + daysInMonth;
  const weekCount = Math.ceil(totalCells / 7);
  const cellCount = weekCount * 7;

  for (let i = 0; i < cellCount; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    cells.push({
      date,
      isCurrentMonth: date.getMonth() === month,
    });
  }

  return {
    year, // keep compatibility for current callers
    month, // keep compatibility for current callers
    daysInMonth,
    startDay,
    weekCount,
    cells,
  };
};

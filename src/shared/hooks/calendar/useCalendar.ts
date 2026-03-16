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
 * 달력 렌더링용 셀 배열(null + day)을 생성합니다.
 */
export const useCalendar = (selectedDate: Date) => {
  const { year, month, daysInMonth, startDay } = useMemo(
    () => getMonthInfo(selectedDate),
    [selectedDate],
  );

  const cells: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return {
    year,
    month,
    cells,
  };
};

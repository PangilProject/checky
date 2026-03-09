import { formatDateKST } from "@/shared/hooks/formatDate";

interface WeekRangeInfo {
  start: Date;
  end: Date;
  label: string;
  week: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 선택 날짜를 기준으로 이번 주(일~토) 범위 정보와 화면 라벨을 생성.
 */
export function getWeekRangeInfo(selectedDate: Date): WeekRangeInfo {
  const start = new Date(selectedDate);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start,
    end,
    label: `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
      end.getMonth() + 1
    }월 ${end.getDate()}일`,
    week: {
      startDate: formatDateKST(start),
      endDate: formatDateKST(end),
    },
  };
}

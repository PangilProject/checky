import {
  WEEK_LABELS,
  getWeekendTextClass,
} from "@/shared/constants/dateLabels";
import { Text } from "@/shared/ui/primitives";

/**
 * 월간 리포트 캘린더의 요일 헤더(일~토)를 렌더링합니다.
 * `WEEK_LABELS`를 7등분 셀로 출력하며, 일요일/토요일은 강조 색상을 적용합니다.
 */
export function CalendarHeader() {
  return (
    <div className="flex w-full border-b border-content-muted">
      {WEEK_LABELS.map((d, index) => (
        <div
          key={d}
          className={`w-[14.285%] text-center font-medium py-2 ${
            getWeekendTextClass(index) ?? ""
          }`}
        >
          <Text variant="bodySm">{d}</Text>
        </div>
      ))}
    </div>
  );
}

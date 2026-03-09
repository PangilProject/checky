import { SATURDAY_COLOR, SUNDAY_COLOR } from "@/shared/constants/color";
import { WEEK_LABELS } from "@/shared/constants/da";
import { Text2 } from "@/shared/ui/Text";

/**
 * 월간 리포트 캘린더의 요일 헤더(일~토)를 렌더링합니다.
 * `WEEK_LABELS`를 7등분 셀로 출력하며, 일요일/토요일은 강조 색상을 적용합니다.
 */
export function CalendarHeader() {
  return (
    <div className="flex w-full border-b border-[#8E8E93]">
      {WEEK_LABELS.map((d, index) => {
        // 주말(일/토)만 색상을 다르게 표시
        const color =
          index === 0 ? SUNDAY_COLOR : index === 6 ? SATURDAY_COLOR : undefined;

        return (
          <div
            key={d}
            className="w-[14.285%] text-center font-medium py-2"
            style={{ color }}
          >
            <Text2 text={d} />
          </div>
        );
      })}
    </div>
  );
}

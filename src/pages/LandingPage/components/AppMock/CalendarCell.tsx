/**
 * 랜딩 필름에 나오는 달력 칸의 겉모습.
 * 클래스는 MonthlyReport/components/CalendarCell.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import { Text, cn } from "@/shared/ui/primitives";
import { getWeekendTextClass } from "@/shared/constants/dateLabels";
import { RING_LENGTH, RING_RADIUS } from "../../constants/calendarRing";

/**
 * 달력 한 칸의 링과 남은 개수 (CalendarCell).
 * 필름은 data-ring-* 속성으로 비율과 숫자를 직접 바꾼다.
 */
export const CalendarRing = ({
  inMonth,
  completed = 0,
  total = 0,
}: {
  inMonth: boolean;
  completed?: number;
  total?: number;
}) => {
  if (!inMonth) {
    return (
      <div className="flex h-7.5 w-7.5 items-center justify-center">
        <div className="h-6 w-6 rounded-full bg-surface-sunken" />
      </div>
    );
  }
  const remaining = total - completed;
  const done = total > 0 && remaining === 0;
  return (
    <div
      data-ring=""
      data-done={done}
      className="group relative flex h-7.5 w-7.5 items-center justify-center"
    >
      <svg viewBox="0 0 30 30" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="15" cy="15" r={RING_RADIUS} fill="none" strokeWidth="2" className="stroke-line" />
        <circle
          data-ring-arc=""
          cx="15"
          cy="15"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${total > 0 ? (RING_LENGTH * completed) / total : 0} ${RING_LENGTH}`}
          transform="rotate(-90 15 15)"
          className="stroke-primary transition-colors group-data-[done=true]:stroke-success"
        />
      </svg>
      <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-line text-xs font-bold text-content transition-colors group-data-[done=true]:bg-success group-data-[done=true]:text-on-success">
        <span data-ring-count="">{remaining}</span>
      </div>
    </div>
  );
};

/** 달력 날짜 글자 (CalendarCell) */
export const CalendarDate = ({
  day,
  weekday,
  inMonth,
}: {
  day: number;
  weekday: number;
  inMonth: boolean;
}) => (
  <Text
    variant="caption"
    className={cn("block", inMonth ? getWeekendTextClass(weekday) : "text-content-muted")}
  >
    {String(day)}
  </Text>
);

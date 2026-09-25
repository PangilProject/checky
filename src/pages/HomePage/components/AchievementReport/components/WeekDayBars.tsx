import type { RangeSummaryDay } from "@/shared/api/monthlyStats";
import { WEEK_LABELS, getWeekendTextClass } from "@/shared/constants/dateLabels";
import { parseYmd } from "@/shared/utils/formatDate";

const BAR_HEIGHT = 60;

/**
 * 한 주의 요일별 막대. 막대 높이는 그날 할 것의 수, 채운 부분은 해낸 수다.
 * 오늘 이후는 점선으로 예정만 보여 준다.
 */
export const WeekDayBars = ({
  days,
  todayYmd,
}: {
  days: RangeSummaryDay[];
  todayYmd: string;
}) => {
  const max = Math.max(1, ...days.map((day) => day.total));
  const unit = BAR_HEIGHT / max;

  return (
    <div className="grid grid-cols-7 items-end gap-1.5">
      {days.map((day) => {
        const weekday = parseYmd(day.date)?.getDay() ?? 0;
        const missed = day.total - day.completed;
        const countLabel = day.upcoming
          ? day.total > 0
            ? `예정 ${day.total}`
            : "–"
          : `${day.completed}/${day.total}`;

        return (
          <div
            key={day.date}
            className="flex flex-col items-center gap-1"
            title={
              day.upcoming
                ? `${Number(day.date.slice(8))}일 · 예정 ${day.total}개`
                : `${Number(day.date.slice(8))}일 · ${day.completed} / ${day.total} 완료`
            }
          >
            <div
              className="flex w-full max-w-6.5 flex-col-reverse gap-0.5"
              style={{ height: BAR_HEIGHT }}
            >
              {day.upcoming ? (
                day.total > 0 && (
                  <i
                    className="block w-full rounded-xs border-[1.5px] border-dashed border-content-muted"
                    style={{ height: day.total * unit }}
                  />
                )
              ) : (
                <>
                  {day.completed > 0 && (
                    <i
                      className="block w-full rounded-xs bg-primary"
                      style={{ height: day.completed * unit }}
                    />
                  )}
                  {missed > 0 && (
                    <i
                      className="block w-full rounded-xs bg-line"
                      style={{ height: missed * unit }}
                    />
                  )}
                </>
              )}
            </div>
            <span
              className={`text-xs ${getWeekendTextClass(weekday) ?? ""} ${
                day.date === todayYmd ? "font-extrabold" : ""
              }`}
            >
              {WEEK_LABELS[weekday]}
            </span>
            <span className="text-[11px] whitespace-nowrap text-content-muted">
              {countLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
};

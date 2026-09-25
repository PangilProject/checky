import { toPercent, type RangeSummaryDay } from "@/shared/api/monthlyStats";
import { parseYmd } from "@/shared/utils/formatDate";

interface WeekRow {
  firstDay: number;
  lastDay: number;
  total: number;
  completed: number;
  upcoming: number;
  isCurrent: boolean;
}

/** 한 달의 날짜를 일요일 시작 주로 끊는다. 첫 주와 마지막 주는 그 달 날짜만 담는다. */
const groupByWeek = (days: RangeSummaryDay[], todayYmd: string) => {
  const rows: WeekRow[] = [];

  days.forEach((day) => {
    const weekday = parseYmd(day.date)?.getDay() ?? 0;
    const dayNumber = Number(day.date.slice(8));
    if (rows.length === 0 || weekday === 0) {
      rows.push({
        firstDay: dayNumber,
        lastDay: dayNumber,
        total: 0,
        completed: 0,
        upcoming: 0,
        isCurrent: false,
      });
    }

    const row = rows[rows.length - 1];
    row.lastDay = dayNumber;
    if (day.upcoming) row.upcoming += day.total;
    else {
      row.total += day.total;
      row.completed += day.completed;
    }
    if (day.date === todayYmd) row.isCurrent = true;
  });

  return rows;
};

/** 한 달의 주차별 가로 막대. 길이는 그 주에 할 것의 수, 채운 부분은 해낸 수다. */
export const MonthWeekBars = ({
  days,
  todayYmd,
}: {
  days: RangeSummaryDay[];
  todayYmd: string;
}) => {
  const rows = groupByWeek(days, todayYmd);
  const max = Math.max(1, ...rows.map((row) => row.total + row.upcoming));
  const width = (count: number) => `${(count / max) * 100}%`;

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => {
        const missed = row.total - row.completed;
        const rate = toPercent(row.completed, row.total);

        return (
          <div
            key={row.firstDay}
            className="grid grid-cols-[62px_1fr_52px] items-center gap-2.5 text-[12.5px]"
            title={`${index + 1}주 · ${
              row.total ? `${row.completed} / ${row.total} 완료` : ""
            }${row.upcoming ? `${row.total ? " · " : ""}예정 ${row.upcoming}개` : ""}`}
          >
            <span className={row.isCurrent ? "font-extrabold" : ""}>
              {index + 1}주{" "}
              <span className="text-xs font-normal text-content-muted">
                {row.firstDay}~{row.lastDay}
              </span>
            </span>
            <div className="flex h-2.5 gap-0.5">
              {row.completed > 0 && (
                <i
                  className="block h-full rounded-xs bg-primary"
                  style={{ width: width(row.completed) }}
                />
              )}
              {missed > 0 && (
                <i
                  className="block h-full rounded-xs bg-line"
                  style={{ width: width(missed) }}
                />
              )}
              {row.upcoming > 0 && (
                <i
                  className="block h-full rounded-xs border-[1.5px] border-dashed border-content-muted"
                  style={{ width: width(row.upcoming) }}
                />
              )}
            </div>
            <span className="text-right text-content-muted">
              {rate === null ? (row.upcoming > 0 ? "예정" : "–") : `${rate}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

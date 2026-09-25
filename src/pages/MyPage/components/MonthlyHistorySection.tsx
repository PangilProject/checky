import { useMemo } from "react";
import { Stack, Text } from "@/shared/ui/primitives";
import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { useMonthlyStatsByMonths } from "@/shared/hooks/calendar";
import { summarizeRange, toPercent } from "@/shared/api/monthlyStats";
import { formatDateToYmd, getTodayYmd, parseYmd } from "@/shared/utils/formatDate";

const MONTH_COUNT = 6;

/** 이번 달을 포함한 최근 n개월의 키와 첫날·말일. 오래된 달부터 담는다. */
const getRecentMonths = (today: Date, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    const first = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    return {
      key: formatDateToYmd(first).slice(0, 7),
      label: `${first.getMonth() + 1}월`,
      startDate: formatDateToYmd(first),
      endDate: formatDateToYmd(last),
    };
  });

/**
 * 최근 6개월 달성률.
 *
 * 달마다 monthlyStats 문서 하나만 읽는다(최대 6건, 캐시 공유). 합산값만 쓰므로 옛 문서도 그대로 쓴다.
 * 문서가 없는 달은 앱을 열지 않은 달이라 "기록 없음"으로 두고, 원본에서 다시 세지 않는다.
 */
export const MonthlyHistorySection = () => {
  const todayYmd = getTodayYmd();
  const months = useMemo(
    () => getRecentMonths(parseYmd(todayYmd) ?? new Date(), MONTH_COUNT),
    [todayYmd],
  );
  const monthKeys = useMemo(() => months.map((month) => month.key), [months]);

  const { statsByMonth, isLoading } = useMonthlyStatsByMonths({
    months: monthKeys,
  });

  const rows = months.map((month) => {
    const stats = statsByMonth[month.key];
    const isCurrent = todayYmd <= month.endDate;
    const summary = summarizeRange({
      statsByMonth,
      startDate: month.startDate,
      endDate: month.endDate,
      cutoffDate: isCurrent ? todayYmd : month.endDate,
    });
    return {
      ...month,
      isCurrent,
      hasRecord: stats != null,
      rate: toPercent(summary.completed, summary.total),
    };
  });

  return (
    <Stack gap={2} direction="col">
      <Text variant="bodySm" tone="muted">
        월별 달성률
      </Text>

      {isLoading ? (
        <Stack gap={2} direction="col">
          {months.map((month) => (
            <SkeletonBlock key={month.key} className="h-4 w-full" />
          ))}
        </Stack>
      ) : (
        <Stack gap={2} direction="col">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[40px_1fr_84px] items-center gap-2.5 text-sm"
            >
              <span className={row.isCurrent ? "font-bold" : ""}>
                {row.label}
              </span>
              <div className="h-2.5 overflow-hidden rounded-xs bg-line">
                <div
                  className="h-full rounded-xs bg-primary"
                  style={{ width: `${row.rate ?? 0}%` }}
                />
              </div>
              <span className="text-right">
                {!row.hasRecord ? (
                  <span className="text-xs text-content-muted">기록 없음</span>
                ) : row.rate === null ? (
                  <span className="text-content-muted">–</span>
                ) : (
                  <>
                    {row.rate}%
                    {row.isCurrent && (
                      <span className="ml-1 text-xs text-content-muted">
                        진행 중
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

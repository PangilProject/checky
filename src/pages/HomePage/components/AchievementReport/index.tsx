import { useMemo, useState } from "react";
import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { useMonthlyStatsByMonths } from "@/shared/hooks/calendar";
import { summarizeRange } from "@/shared/api/monthlyStats";
import { buildMonthKeysBetween } from "@/shared/api/monthlyStats/monthKeys";
import { formatDateToYmd, parseYmd } from "@/shared/utils/formatDate";
import { moveMonth, moveWeek } from "@/shared/utils/dateNavigation";
import {
  getAchievementRanges,
  type AchievementMode,
} from "./utils/getAchievementRanges";
import { ModeToggle } from "./components/ModeToggle";
import { AchievementSummary } from "./components/AchievementSummary";
import { AchievementSkeleton } from "./components/AchievementSkeleton";

const getLabel = (mode: AchievementMode, startDate: string, endDate: string) => {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  if (mode === "month") return `${startYear}년 ${startMonth}월`;

  const [, endMonth, endDay] = endDate.split("-").map(Number);
  return `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`;
};

/**
 * 달성 현황 섹션.
 *
 * 선택 날짜가 속한 주나 달에 만든 할 일·루틴 중 몇 개를 해냈는지 보여 준다.
 * 숫자는 달력과 같은 monthlyStats 문서에서 오므로 달력과 어긋나지 않고, 대부분 추가 조회가 없다.
 * 화살표는 다른 섹션과 같이 선택 날짜를 옮긴다.
 */
function AchievementReportSection() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const [mode, setMode] = useState<AchievementMode>("week");

  const todayYmd = formatDateToYmd(new Date());
  const selectedYmd = formatDateToYmd(selectedDate);

  // selectedDate 는 같은 날짜여도 객체가 새로 만들어질 수 있어, 날짜 문자열을 기준으로 계산한다
  const ranges = useMemo(
    () =>
      getAchievementRanges({
        selectedDate: parseYmd(selectedYmd) ?? new Date(),
        mode,
        today: parseYmd(todayYmd) ?? new Date(),
      }),
    [selectedYmd, mode, todayYmd],
  );

  // 할 일·루틴을 나눠 보여 주는 것은 지금 기간뿐이라, 비교 기간의 달은 고치지 않는다
  const periodMonths = useMemo(
    () => buildMonthKeysBetween(ranges.period.startDate, ranges.period.endDate),
    [ranges.period],
  );

  const { statsByMonth, isLoading } = useMonthlyStatsByMonths({
    months: ranges.months,
    repairMonths: periodMonths,
    managedMonth: selectedYmd.slice(0, 7),
  });

  const summary = useMemo(
    () => summarizeRange({ statsByMonth, ...ranges.period }),
    [statsByMonth, ranges.period],
  );
  const compareSummary = useMemo(
    () =>
      ranges.compare ? summarizeRange({ statsByMonth, ...ranges.compare }) : null,
    [statsByMonth, ranges.compare],
  );

  const move = (diff: number) =>
    setSelectedDate(
      mode === "week" ? moveWeek(selectedDate, diff) : moveMonth(selectedDate, diff),
    );

  return (
    <div>
      <TitleSection
        title="달성 현황"
        subTitle={getLabel(mode, ranges.period.startDate, ranges.period.endDate)}
        leftOnClick={() => move(-1)}
        rightOnClick={() => move(1)}
        extra={<ModeToggle mode={mode} onChange={setMode} />}
      />

      {isLoading ? (
        <AchievementSkeleton />
      ) : (
        <AchievementSummary
          mode={mode}
          status={ranges.status}
          summary={summary}
          compareSummary={compareSummary}
          compareMonth={ranges.compare?.startDate.slice(5, 7)}
          todayYmd={todayYmd}
        />
      )}
    </div>
  );
}

export default AchievementReportSection;

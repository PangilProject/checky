import { useMemo, useState } from "react";
import { VscTriangleLeft, VscTriangleRight } from "react-icons/vsc";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
import { formatDateToYmd, getTodayYmd, parseYmd } from "@/shared/utils/formatDate";
import { moveMonth, moveWeek } from "@/shared/utils/dateNavigation";
import {
  getAchievementRanges,
  type AchievementMode,
} from "@/shared/utils/getAchievementRanges";
import { SegmentedToggle } from "@/shared/ui/SegmentedToggle";
import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { TitleText } from "@/shared/ui/TitleText";
import { Button, Stack, Text } from "@/shared/ui/primitives";
import { useRecordData } from "./hooks/useRecordData";
import {
  CategoryBreakdown,
  RecordTiles,
  RemainingTasks,
  RoutineRows,
} from "./components/RecordSections";

const MODE_OPTIONS = [
  { value: "week", label: "주간" },
  { value: "month", label: "월간" },
] as const satisfies readonly { value: AchievementMode; label: string }[];

const formatMonthDay = (ymd: string) =>
  `${Number(ymd.slice(5, 7))}월 ${Number(ymd.slice(8, 10))}일`;

/**
 * 기록 화면. 한 주나 한 달 동안 무엇을 해냈고 무엇이 남았는지 돌아본다.
 *
 * 숫자와 목록만 보여 주고 평가하거나 권하지 않는다. 판단은 사용자에게 맡긴다.
 * 기간 규칙은 홈의 달성 현황과 같다(getAchievementRanges). 오늘 뒤의 날은 세지 않는다.
 */
function RecordPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<AchievementMode>("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const todayYmd = getTodayYmd();
  const selectedYmd = formatDateToYmd(selectedDate);
  const { period, status } = useMemo(
    () =>
      getAchievementRanges({
        selectedDate: parseYmd(selectedYmd) ?? new Date(),
        mode,
        today: parseYmd(todayYmd) ?? new Date(),
      }),
    [selectedYmd, mode, todayYmd],
  );

  const { summary, isLoading, isError, refetch } = useRecordData(period);
  const { data: categories = [] } = useCategoriesQuery(user?.uid ?? "");

  const periodLabel =
    mode === "month"
      ? `${Number(period.startDate.slice(0, 4))}년 ${Number(period.startDate.slice(5, 7))}월`
      : `${formatMonthDay(period.startDate)} ~ ${formatMonthDay(period.endDate)}`;
  const subTitle =
    status === "current"
      ? `${periodLabel} · ${formatMonthDay(period.cutoffDate)}까지`
      : periodLabel;

  const move = (diff: number) =>
    setSelectedDate(
      mode === "week" ? moveWeek(selectedDate, diff) : moveMonth(selectedDate, diff),
    );

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-y-2">
        <div>
          <TitleText text="돌아보기" />
          <Text variant="bodySm">{subTitle}</Text>
        </div>
        <Stack gap={3} direction="row" align="center">
          <SegmentedToggle
            options={MODE_OPTIONS}
            value={mode}
            onChange={setMode}
            label="기간"
          />
          <button
            type="button"
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1 text-sm rounded-md bg-surface-hover hover:bg-surface-selected pressable"
          >
            {mode === "week" ? "이번 주" : "이번 달"}
          </button>
          <button
            type="button"
            aria-label={mode === "week" ? "이전 주" : "이전 달"}
            onClick={() => move(-1)}
            className="pressable"
          >
            <VscTriangleLeft size={20} />
          </button>
          <button
            type="button"
            aria-label={mode === "week" ? "다음 주" : "다음 달"}
            onClick={() => move(1)}
            className="pressable"
          >
            <VscTriangleRight size={20} />
          </button>
        </Stack>
      </div>

      {status === "future" ? (
        <Text variant="bodySm" tone="muted" className="py-8 text-center">
          아직 오지 않은 기간이에요.
        </Text>
      ) : isError ? (
        <Stack gap={3} direction="col" align="center" className="py-10">
          <Text variant="bodySm" tone="muted">
            기록을 불러오지 못했습니다.
          </Text>
          <Button onClick={refetch}>다시 시도</Button>
        </Stack>
      ) : isLoading ? (
        <Stack gap={6} direction="col">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-40 w-full" />
        </Stack>
      ) : (
        <>
          <RecordTiles summary={summary} />
          <CategoryBreakdown summary={summary} />
          <RemainingTasks summary={summary} categories={categories} todayYmd={todayYmd} />
          <RoutineRows summary={summary} />
        </>
      )}
    </div>
  );
}

export default RecordPage;

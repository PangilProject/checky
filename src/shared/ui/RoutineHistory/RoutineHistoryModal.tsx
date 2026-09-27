import { useState } from "react";
import type { Routine, RoutineCount } from "@/shared/api/routine";
import { toPercent } from "@/shared/api/monthlyStats";
import { getCategoryColor, getCategoryTextColor } from "@/shared/constants/colors";
import { getDayLabel } from "@/shared/constants/dateLabels";
import {
  useRoutineHistory,
  type RoutineHistoryPeriod,
} from "@/shared/hooks/useRoutineHistory";
import { getTodayYmd } from "@/shared/utils/formatDate";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { SegmentedToggle } from "@/shared/ui/SegmentedToggle";
import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { Button, Stack, Text } from "@/shared/ui/primitives";
import { RoutineDayGrid } from "./RoutineDayGrid";

const PERIOD_OPTIONS = [
  { value: "month", label: "1개월" },
  { value: "quarter", label: "3개월" },
] as const satisfies readonly { value: RoutineHistoryPeriod; label: string }[];

const formatMonthDay = (ymd: string) =>
  `${Number(ymd.slice(5, 7))}월 ${Number(ymd.slice(8, 10))}일`;

const formatDays = (days: number[]) =>
  [...days]
    .sort((a, b) => a - b)
    .map(getDayLabel)
    .join(" ");

interface RoutineHistoryModalProps {
  routine: Routine;
  category?: { name: string; color: string };
  onClose: () => void;
  /** 넘기면 "루틴 정보" 버튼을 그린다. 루틴 화면처럼 고칠 수 있는 곳에서만 넘긴다 */
  onOpenDetail?: () => void;
}

/**
 * 루틴 하나의 기록 창.
 *
 * 수행 달력, 요일별 횟수, 반복 요일을 바꾸기 전과 후의 횟수를 보여 준다.
 * 판단은 사용자에게 맡기므로 평가하거나 권하는 문구는 넣지 않는다.
 */
export const RoutineHistoryModal = ({
  routine,
  category,
  onClose,
  onOpenDetail,
}: RoutineHistoryModalProps) => {
  const [period, setPeriod] = useState<RoutineHistoryPeriod>("quarter");
  const todayYmd = getTodayYmd();
  const { days, summary, isLoading, isError, refetch } = useRoutineHistory({
    routine,
    period,
    todayYmd,
  });

  const color = category?.color ?? "";
  const isEnded = Boolean(routine.endDate && routine.endDate < todayYmd);
  const scheduleLabel = isEnded
    ? `${formatMonthDay(routine.endDate ?? "")}에 끝남`
    : `지금은 ${formatDays(routine.days)}`;
  const subTitle = [
    category?.name,
    `${formatMonthDay(routine.startDate)} 시작`,
    scheduleLabel,
  ]
    .filter(Boolean)
    .join(" · ");
  const rate = toPercent(summary.done, summary.total);

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle text={routine.title} />

      <div className="-mt-3 mb-6 flex items-center justify-between gap-3">
        <Text variant="bodySm" tone="muted" className="min-w-0">
          {subTitle}
        </Text>
        <SegmentedToggle
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          label="보여 줄 기간"
        />
      </div>

      {isError ? (
        <Stack gap={3} direction="col" align="center" className="py-8">
          <Text variant="bodySm" tone="muted">
            기록을 불러오지 못했습니다.
          </Text>
          <Button onClick={() => void refetch()}>다시 시도</Button>
        </Stack>
      ) : isLoading ? (
        <Stack gap={4} direction="col" className="mb-10">
          <SkeletonBlock className="h-10 w-32" />
          <SkeletonBlock className="h-48 w-full" />
          <SkeletonBlock className="h-20 w-full" />
        </Stack>
      ) : (
        <div className="mb-10 flex flex-col gap-7">
          <div className="flex items-baseline gap-2">
            {rate === null ? (
              <Text variant="bodySm" tone="muted">
                이 기간에는 해야 했던 날이 없어요
              </Text>
            ) : (
              <>
                <span className="text-3xl font-bold">
                  {rate}
                  <span className="text-lg">%</span>
                </span>
                <Text as="span" variant="bodySm" tone="muted">
                  해야 했던 {summary.total}번 중{" "}
                  <b className="text-content">{summary.done}번</b> 했어요
                </Text>
              </>
            )}
          </div>

          <section className="flex flex-col gap-2">
            <Text as="h3" variant="bodySm" className="font-bold">
              수행 달력
            </Text>
            <RoutineDayGrid
              days={days}
              todayYmd={todayYmd}
              fillColor={getCategoryColor(color)}
              lineColor={getCategoryTextColor(color)}
            />
          </section>

          {summary.byWeekday.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <Text as="h3" variant="bodySm" className="font-bold">
                요일별
              </Text>
              <div className="grid grid-cols-[28px_1fr_64px_40px] items-center gap-x-2.5 gap-y-2 text-sm">
                {summary.byWeekday.map((item) => (
                  <CountRow key={item.day} label={getDayLabel(item.day)} count={item} />
                ))}
              </div>
            </section>
          )}

          {summary.segments.length > 1 && (
            <section className="flex flex-col gap-2.5">
              <Text as="h3" variant="bodySm" className="font-bold">
                반복 요일 이력
              </Text>
              <ol className="flex flex-col">
                {summary.segments.map((segment, index) => (
                  <li key={segment.from} className="flex gap-3">
                    <div className="flex w-2.5 flex-col items-center" aria-hidden="true">
                      <span
                        className={`mt-1.5 size-2.5 rounded-full ${
                          segment.isCurrent ? "bg-primary" : "bg-line"
                        }`}
                      />
                      {index < summary.segments.length - 1 && (
                        <span className="w-px flex-1 bg-line" />
                      )}
                    </div>
                    <div className="flex flex-1 justify-between pb-4">
                      <div>
                        <p className={`text-sm ${segment.isCurrent ? "font-bold" : ""}`}>
                          {formatDays(segment.days)}
                          {segment.isCurrent && (
                            <span className="font-normal text-content-muted"> · 지금</span>
                          )}
                        </p>
                        <p className="text-xs text-content-muted">
                          {formatMonthDay(segment.from)} ~ {formatMonthDay(segment.until)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {segment.done} / {segment.total}
                        </p>
                        <p className="text-xs text-content-muted">
                          {toPercent(segment.done, segment.total) ?? "-"}
                          {segment.total > 0 && "%"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <Text variant="caption" tone="muted">
                고른 기간 안에서 센 횟수예요.
              </Text>
            </section>
          )}
        </div>
      )}

      <Stack gap={2} direction="row" justify="between">
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        {onOpenDetail && <Button onClick={onOpenDetail}>루틴 정보</Button>}
      </Stack>
    </ModalWrapper>
  );
};

const CountRow = ({ label, count }: { label: string; count: RoutineCount }) => {
  const rate = toPercent(count.done, count.total) ?? 0;
  return (
    <>
      <span>{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
      </span>
      <span className="text-right">
        {count.done} / {count.total}
      </span>
      <span className="text-right text-content-muted">{rate}%</span>
    </>
  );
};

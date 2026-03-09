import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { moveWeek } from "@/shared/hooks/dateNavigation";
import { Space24 } from "@/shared/ui/Space";
import { RoutineTable } from "./RoutineTable";
import { useAuth } from "@/shared/hooks/useAuth";
import { formatDateKST } from "@/shared/hooks/formatDate";
import { useRoutineReportQuery } from "@/shared/query/useRoutineReportQuery";
import type { RoutineReport, RoutineReportRow } from "@/shared/api/routine";
import { toggleRoutineLog } from "@/shared/api/routineLog";
import { useQueryClient } from "@tanstack/react-query";
import { routineLogKeys, routineReportKeys } from "@/shared/query/keys";
import { RoutineReportSkeleton } from "./RoutineReportSkeleton";

function RoutineReportSection() {
  const { user } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const queryClient = useQueryClient();

  // ✅ 주 시작 / 끝 계산 (일요일 기준)
  const start = new Date(selectedDate);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const label = `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
    end.getMonth() + 1
  }월 ${end.getDate()}일`;

  // ✅ week 객체 (RoutineReport용)
  const week = {
    startDate: formatDateKST(start),
    endDate: formatDateKST(end),
  };

  const { data: report, isLoading, refetch } = useRoutineReportQuery({
    userId: user?.uid,
    startDate: week.startDate,
    endDate: week.endDate,
  });
  const routineReportKey = routineReportKeys.byWeek(
    user?.uid ?? "",
    week.startDate,
    week.endDate
  );

  const handleToggle = async (
    routineId: string,
    date: string,
    current: boolean
  ) => {
    if (!user) return;
    const monthKey = date.slice(0, 7);
    const done = !current;

    queryClient.setQueryData<RoutineReport>(routineReportKey, (prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        rows: prev.rows.map((row: RoutineReportRow) =>
          row.routineId !== routineId
            ? row
            : {
                ...row,
                checks: {
                  ...row.checks,
                  [date]: done,
                },
              }
        ),
      };
    });

    queryClient.setQueryData(
      routineLogKeys.byMonth(user.uid, monthKey),
      (prev: { routineId: string; date: string; done: boolean }[] | undefined) => {
        if (!prev) return prev;
        const index = prev.findIndex(
          (log) => log.routineId === routineId && log.date === date
        );

        if (index === -1) {
          if (!done) return prev;
          return [...prev, { routineId, date, done }];
        }

        const next = [...prev];
        next[index] = { ...next[index], done };
        return next;
      }
    );

    await toggleRoutineLog({
      userId: user.uid,
      routineId,
      date,
      done,
    });
  };

  return (
    <div>
      <TitleSection
        title="루틴 목록"
        subTitle={label}
        leftOnClick={() => setSelectedDate(moveWeek(selectedDate, -1))}
        rightOnClick={() => setSelectedDate(moveWeek(selectedDate, 1))}
        onTodayClick={() => setSelectedDate(new Date())}
        onRefreshClick={() => {
          void refetch();
        }}
      />

      {isLoading ? (
        <RoutineReportSkeleton />
      ) : (
        report && <RoutineTable report={report} onToggle={handleToggle} />
      )}

      <Space24 direction="mb" />
    </div>
  );
}

export default RoutineReportSection;

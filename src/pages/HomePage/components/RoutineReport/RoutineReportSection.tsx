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
import { routineReportKeys } from "@/shared/query/keys";
import { useEffect } from "react";
import { getRoutineLogsByWeek } from "@/shared/api/routineLog";
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

  const { data: report, isLoading } = useRoutineReportQuery({
    userId: user?.uid,
    startDate: week.startDate,
    endDate: week.endDate,
  });
  const routineReportKey = routineReportKeys.byWeek(
    user?.uid ?? "",
    week.startDate,
    week.endDate
  );

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getRoutineLogsByWeek({
      userId: user.uid,
      startDate: week.startDate,
      endDate: week.endDate,
      onChange: (logs, hasChanges) => {
        if (!hasChanges) return;
        const logMap = new Map(
          logs.map((log) => [`${log.routineId}_${log.date}`, log.done])
        );

        queryClient.setQueryData<RoutineReport>(routineReportKey, (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              rows: prev.rows.map((row: RoutineReportRow) => {
                const nextChecks = { ...row.checks };
                Object.keys(nextChecks).forEach((date) => {
                  const key = `${row.routineId}_${date}`;
                  if (logMap.has(key)) {
                    nextChecks[date] = Boolean(logMap.get(key));
                  }
                });
                return { ...row, checks: nextChecks };
              }),
            };
          });
      },
    });

    return () => unsubscribe();
  }, [queryClient, user, week.endDate, week.startDate]);

  const handleToggle = async (
    routineId: string,
    date: string,
    current: boolean
  ) => {
    if (!user) return;

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
                  [date]: !current,
                },
              }
        ),
      };
    });

    await toggleRoutineLog({
      userId: user.uid,
      routineId,
      date,
      done: !current,
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

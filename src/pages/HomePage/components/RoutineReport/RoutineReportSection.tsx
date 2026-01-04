import { useEffect, useState } from "react";
import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/DateContext";
import { moveWeek } from "@/shared/hooks/dateNavigation";
import { Space24 } from "@/shared/ui/Space";
import { RoutineTable } from "./RoutineTable";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  getRoutineReportByWeek,
  type RoutineReport,
} from "@/shared/api/routine";

function RoutineReportSection() {
  const { user } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const [report, setReport] = useState<RoutineReport | null>(null);

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
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };

  useEffect(() => {
    if (!user) return;

    const fetchReport = async () => {
      const result = await getRoutineReportByWeek({
        userId: user.uid,
        startDate: week.startDate,
        endDate: week.endDate,
      });

      setReport(result);
    };

    fetchReport();
  }, [user, week.startDate]);

  return (
    <div>
      <TitleSection
        title="루틴 목록"
        subTitle={label}
        leftOnClick={() => setSelectedDate(moveWeek(selectedDate, -1))}
        rightOnClick={() => setSelectedDate(moveWeek(selectedDate, 1))}
      />

      {/* ✅ 데이터 준비되었을 때만 렌더 */}
      {report && (
        <RoutineTable
          report={report}
          setReport={setReport} // ✅ 추가
        />
      )}

      <Space24 direction="mb" />
    </div>
  );
}

export default RoutineReportSection;

import TitleSection from "../TitleSection";
import { useSelectedDate } from "@/shared/contexts/useSelectedDate";
import { moveWeek } from "@/shared/hooks/dateNavigation";
import { Space24 } from "@/shared/ui/Space";
import { RoutineTable } from "./components/RoutineTable";
import { useAuth } from "@/shared/hooks/useAuth";
import { useRoutineReportQuery } from "@/shared/hooks/useRoutineReportQuery";
import { useQueryClient } from "@tanstack/react-query";
import { RoutineReportSkeleton } from "./components/RoutineReportSkeleton";
import { getWeekRangeInfo } from "./utils/getWeekRangeInfo";
import { useRoutineToggle } from "./hooks/useRoutineToggle";
import { NormalBlackButton } from "@/shared/ui/Button";

/**
 * 주간 루틴 리포트 섹션을 렌더링합니다.
 * 주차 이동, 새로고침, 루틴 체크 토글 흐름을 조합합니다.
 */
function RoutineReportSection() {
  const { user } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const queryClient = useQueryClient();

  // 선택 날짜 기준 주간 범위/라벨/쿼리 키에 필요한 날짜 문자열을 계산
  const { label, week } = getWeekRangeInfo(selectedDate);

  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useRoutineReportQuery({
    userId: user?.uid,
    startDate: week.startDate,
    endDate: week.endDate,
  });

  const handleToggle = useRoutineToggle({
    userId: user?.uid,
    queryClient,
    week,
  });

  return (
    <div>
      {/* 1. 타이틀 */}
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

      {/* 2. 테이블 */}
      {isLoading ? (
        // 2-1. 테이블 스킬레톤
        <RoutineReportSkeleton />
      ) : isError || !report ? (
        // 2-2. 조회 실패: 빈 공간만 보이지 않도록 상태와 재시도를 제공
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-[#8E8E93]">
            루틴 목록을 불러오지 못했습니다.
          </p>
          <NormalBlackButton text="다시 시도" onClick={() => void refetch()} />
        </div>
      ) : (
        // 2-3. 테이블
        <RoutineTable report={report} onToggle={handleToggle} />
      )}

      <Space24 direction="mb" />
    </div>
  );
}

export default RoutineReportSection;

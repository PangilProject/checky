import { WEEK_LABELS } from "@/shared/constants/dateLabels";
import { SkeletonBlock } from "@/shared/ui/Skeleton";

/**
 * 월간 리포트의 캘린더 섹션 로딩 시 보여지는 스켈레톤 컴포넌트입니다.
 * 요일 헤더와 5주(35일) 분량의 날짜 영역을 스켈레톤으로 구성합니다.
 *
 * @returns {JSX.Element} 월간 리포트 캘린더 스켈레톤 UI
 */
export const MonthlyReportSkeleton = () => {
  return (
    <div className="w-full flex flex-col">
      {/* 1. 요일 영역*/}
      <div className="flex w-full border-b border-[#8E8E93]">
        {WEEK_LABELS.map((label) => (
          <div key={label} className="w-[14.285%] text-center font-medium py-2">
            <SkeletonBlock className="mx-auto h-4 w-6" />
          </div>
        ))}
      </div>

      {/* 2. 일별 영역 */}
      <div className="flex flex-wrap w-full">
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            key={index}
            className="w-[14.285%] h-15 flex flex-col items-center justify-center gap-2"
          > 
            <SkeletonBlock className="w-6 h-6 rounded-full" />
            <SkeletonBlock className="h-3 w-5" />
          </div>
        ))}
      </div>
    </div>
  );
};

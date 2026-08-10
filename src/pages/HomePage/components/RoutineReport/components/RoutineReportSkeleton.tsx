import { SkeletonBlock } from "@/shared/ui/Skeleton";

/**
 * 루틴 리포트 로딩 중 표시되는 테이블 형태 스켈레톤입니다.
 */
export const RoutineReportSkeleton = () => {
  return (
    <div className="w-full">
      <div className="border border-content-muted">
        <div className="grid grid-cols-9">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={`head-${index}`} className="p-2 border-b border-content-muted">
              <SkeletonBlock className="h-4 w-full" />
            </div>
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-9">
            {Array.from({ length: 9 }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="p-2 border-b border-line">
                <SkeletonBlock className="h-4 w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

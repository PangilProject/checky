import { SkeletonBlock } from "@/shared/ui/Skeleton";

export const RoutineReportSkeleton = () => {
  return (
    <div className="w-full">
      <div className="border border-[#8E8E93]">
        <div className="grid grid-cols-9">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={`head-${index}`} className="p-2 border-b border-[#8E8E93]">
              <SkeletonBlock className="h-4 w-full" />
            </div>
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-9">
            {Array.from({ length: 9 }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="p-2 border-b border-[#f0f0f0]">
                <SkeletonBlock className="h-4 w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

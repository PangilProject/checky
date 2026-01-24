import { SkeletonBlock } from "@/shared/ui/Skeleton";

export const RoutineListSkeleton = () => {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`routine-group-${index}`} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="h-8 w-16" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div
                key={`routine-item-${index}-${rowIndex}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-3 w-3 rounded-full" />
                  <SkeletonBlock className="h-4 w-40" />
                </div>
                <SkeletonBlock className="h-4 w-6" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

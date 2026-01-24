import { SkeletonBlock } from "@/shared/ui/Skeleton";

export const TaskListSkeleton = () => {
  return (
    <div className="flex flex-col w-full gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`category-${index}`} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-12" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div
                key={`item-${index}-${rowIndex}`}
                className="flex items-center gap-3"
              >
                <SkeletonBlock className="h-4 w-4 rounded-sm" />
                <SkeletonBlock className="h-4 flex-1" />
                <SkeletonBlock className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

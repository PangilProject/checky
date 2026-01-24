import { SkeletonBlock } from "@/shared/ui/Skeleton";

export const CategoryListSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`category-skeleton-${index}`} className="flex items-center">
          <SkeletonBlock className="h-4 w-4 rounded-sm mr-3" />
          <SkeletonBlock className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
};

import { SkeletonBlock } from "@/shared/ui/Skeleton";

/** 달성 현황을 읽는 동안 보여 주는 자리 */
export const AchievementSkeleton = () => {
  return (
    <div className="mt-2.5 flex flex-col gap-3.5 rounded-xl bg-surface-sunken p-4">
      <SkeletonBlock className="h-8 w-20" />
      <SkeletonBlock className="h-4 w-48" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-8 w-full" />
        <SkeletonBlock className="h-8 w-full" />
      </div>
      <SkeletonBlock className="h-20 w-full" />
    </div>
  );
};

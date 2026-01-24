import { SkeletonBlock } from "@/shared/ui/Skeleton";

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export const MonthlyReportSkeleton = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex w-full border-b border-[#8E8E93]">
        {WEEK_LABELS.map((label) => (
          <div
            key={label}
            className="w-[14.285%] text-center font-medium py-2"
          >
            <SkeletonBlock className="mx-auto h-4 w-6" />
          </div>
        ))}
      </div>
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

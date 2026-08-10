import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { Stack } from "@/shared/ui/primitives";

export const TaskListSkeleton = () => {
  return (
    <Stack gap={6} direction="col" className="w-full">
      {Array.from({ length: 2 }).map((_, index) => (
        <Stack gap={3} direction="col" key={`category-${index}`}>
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-12" />
          </div>
          <Stack gap={2} direction="col">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <Stack
                gap={3}
                direction="row"
                align="center"
                key={`item-${index}-${rowIndex}`}
              >
                <SkeletonBlock className="h-4 w-4 rounded-sm" />
                <SkeletonBlock className="h-4 flex-1" />
                <SkeletonBlock className="h-4 w-10" />
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { Stack } from "@/shared/ui/primitives";

/**
 * 루틴 리스트 로딩 상태에서 표시되는 스켈레톤 UI 컴포넌트
 */

export const RoutineListSkeleton = () => {
  return (
    <Stack gap={8} direction="col">
      {/* 카테고리 그룹 스켈레톤 (예: 2개 카테고리) */}
      {Array.from({ length: 2 }).map((_, index) => (
        <Stack gap={4} direction="col" key={`routine-group-${index}`}>
          {/* 카테고리 헤더 (제목 + 버튼) */}
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="h-8 w-16" />
          </div>

          {/* 루틴 리스트 */}
          <Stack gap={3} direction="col">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div
                key={`routine-item-${index}-${rowIndex}`}
                className="flex items-center justify-between"
              >
                {/* 루틴 정보 영역 */}
                <Stack gap={3} direction="row" align="center">
                  <SkeletonBlock className="h-3 w-3 rounded-full" />
                  <SkeletonBlock className="h-4 w-40" />
                </Stack>

                {/* 더보기 버튼 영역 */}
                <SkeletonBlock className="h-4 w-6" />
              </div>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

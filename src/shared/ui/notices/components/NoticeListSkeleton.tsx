import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { Stack } from "@/shared/ui/primitives";

interface NoticeListSkeletonProps {
  /** 표시할 행 수. 고정 높이 콘텐츠 영역을 채울 만큼만 그린다. */
  rows?: number;
}

/**
 * 공지 목록 로딩 스켈레톤.
 *
 * 실제 목록 행과 동일한 테두리·여백·줄높이를 사용해 같은 높이를 차지한다.
 * 모달의 콘텐츠 영역 높이가 고정되어 있으므로 행 수는 그 영역을 채우는
 * 용도이며, 실제 공지 개수와 달라도 레이아웃이 흔들리지 않는다.
 */
export const NoticeListSkeleton = ({ rows = 5 }: NoticeListSkeletonProps) => {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label="공지사항을 불러오는 중입니다"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`notice-skeleton-${index}`}
          className="border border-line rounded p-3"
        >
          {/* h-5: 제목(text-sm)의 줄높이와 동일하게 유지해 행 높이를 맞춘다 */}
          <Stack
            gap={2}
            direction="row"
            align="center"
            justify="between"
            className="h-5"
          >
            <SkeletonBlock className="h-4 min-w-0 flex-1" />
            <SkeletonBlock className="h-3 w-14 shrink-0" />
          </Stack>
        </div>
      ))}
    </div>
  );
};

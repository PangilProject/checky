import { Stack, Text } from "@/shared/ui/primitives";
import { NoticePinnedLabel } from "./NoticePinnedLabel";
import { formatNoticeDate } from "./formatNoticeDate";
import type { Notice } from "../hooks/useNotices";

interface Props {
  notices: Notice[];
  onSelect: (notice: Notice) => void;
}

export default function NoticeList({ notices, onSelect }: Props) {
  if (notices.length === 0) {
    // 콘텐츠 영역 높이가 고정되어 있으므로 안내 문구를 중앙에 둔다
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="bodySm" tone="muted">
          공지사항이 없습니다.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <div
          key={notice.id}
          onClick={() => onSelect(notice)}
          /*
            고정 공지는 옅은 배경과 한 단계 진한 테두리로만 구분한다.
            강조 요소를 여러 개 겹치면 제목보다 장식이 먼저 읽힌다.
            hover 는 배경이 아니라 테두리로 반응시켜, 고정 배경과 충돌하지 않게 한다.
          */
          className={`cursor-pointer rounded-lg border p-3 pressable transition-colors hover:border-content-muted ${
            notice.pinned
              ? "border-content-subtle bg-surface-sunken"
              : "border-line bg-surface-raised"
          }`}
        >
          <Stack gap={3} direction="row" align="center" justify="between">
            <Text
              variant="bodySm"
              className={`min-w-0 flex-1 truncate ${
                notice.pinned ? "font-semibold" : "font-medium"
              }`}
            >
              {notice.title}
            </Text>
            {/*
              고정 표시는 날짜와 함께 오른쪽 메타 영역에 둔다.
              제목 앞에 두면 고정 공지만 제목 시작 위치가 밀려 목록의 왼쪽 정렬이 흐트러진다.
            */}
            <Stack gap={2} direction="row" align="center" className="shrink-0">
              {notice.pinned && <NoticePinnedLabel />}
              <Text variant="caption" tone="muted">
                {formatNoticeDate(notice.createdAt)}
              </Text>
            </Stack>
          </Stack>
        </div>
      ))}
    </div>
  );
}

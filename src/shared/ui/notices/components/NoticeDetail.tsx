import { Stack, Text } from "@/shared/ui/primitives";
import { NoticePinnedLabel } from "./NoticePinnedLabel";
import { formatDateDot } from "@/shared/utils/formatDate";
import type { Notice } from "../hooks/useNotices";

interface Props {
  notice: Notice;
}

export default function NoticeDetail({ notice }: Props) {
  return (
    <div>
      <Text variant="body" className="mb-2 font-bold wrap-break-word">
        {notice.title}
      </Text>

      {/*
        고정 표시와 작성일은 제목이 아니라 부가 정보이므로 제목 아래에 함께 묶는다.
        목록에서도 두 정보를 같이 두었으므로 읽는 방식이 일관된다.
        상세에는 작성일이 아예 없어 언제 올라온 공지인지 알 수 없었다.
      */}
      <Stack gap={2} direction="row" align="center">
        {notice.pinned && <NoticePinnedLabel />}
        <Text variant="caption" tone="muted">
          {formatDateDot(notice.createdAt)}
        </Text>
      </Stack>

      {/* 머리말과 본문을 가르는 얇은 구분선 */}
      <div className="my-4 border-t border-line" />

      <Text
        variant="bodySm"
        className="whitespace-pre-wrap wrap-break-word text-content"
      >
        {notice.content}
      </Text>
    </div>
  );
}

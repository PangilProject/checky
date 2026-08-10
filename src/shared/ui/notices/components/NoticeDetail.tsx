import { Text1, Text2, Text3 } from "@/shared/ui/Text";
import { Space2, Space4 } from "@/shared/ui/Space";
import { NoticePinnedLabel } from "./NoticePinnedLabel";
import { formatNoticeDate } from "./formatNoticeDate";
import type { Notice } from "../hooks/useNotices";

interface Props {
  notice: Notice;
}

export default function NoticeDetail({ notice }: Props) {
  return (
    <div>
      <Text3 text={notice.title} className="font-bold wrap-break-word" />
      <Space2 direction="mb" />

      {/*
        고정 표시와 작성일은 제목이 아니라 부가 정보이므로 제목 아래에 함께 묶는다.
        목록에서도 두 정보를 같이 두었으므로 읽는 방식이 일관된다.
        상세에는 작성일이 아예 없어 언제 올라온 공지인지 알 수 없었다.
      */}
      <div className="flex items-center gap-2">
        {notice.pinned && <NoticePinnedLabel />}
        <Text1
          text={formatNoticeDate(notice.createdAt)}
          className="text-content-muted"
        />
      </div>

      <Space4 direction="mb" />
      {/* 머리말과 본문을 가르는 얇은 구분선 */}
      <div className="border-t border-line" />
      <Space4 direction="mb" />

      <Text2
        text={notice.content}
        className="whitespace-pre-wrap wrap-break-word text-content"
      />
    </div>
  );
}

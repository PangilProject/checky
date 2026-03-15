import { Text3, Text2 } from "@/shared/ui/Text";
import { Space8, Space10 } from "@/shared/ui/Space";
import { NormalBlackUnFillButton } from "@/shared/ui/Button";
import type { Notice } from "../hooks/useNotices";

interface Props {
  notice: Notice;
  onBack: () => void;
}

export default function NoticeDetail({ notice, onBack }: Props) {
  return (
    <div>
      <Text3
        text={`${notice.pinned ? "📌 " : ""}${notice.title}`}
        className="font-bold"
      />
      <Space8 direction="mb" />
      <Text2
        text={notice.content}
        className="whitespace-pre-wrap text-gray-700"
      />
      <Space10 direction="mb" />

      <NormalBlackUnFillButton text="목록으로" onClick={onBack} />
    </div>
  );
}

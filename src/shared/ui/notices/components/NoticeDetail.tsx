import { Text3, Text2 } from "@/shared/ui/Text";
import { Space8 } from "@/shared/ui/Space";
import type { Notice } from "../hooks/useNotices";

interface Props {
  notice: Notice;
}

export default function NoticeDetail({ notice }: Props) {
  return (
    <div>
      <Text3
        text={`${notice.pinned ? "📌 " : ""}${notice.title}`}
        className="font-bold wrap-break-word"
      />
      <Space8 direction="mb" />
      <Text2
        text={notice.content}
        className="whitespace-pre-wrap wrap-break-word text-gray-700"
      />
    </div>
  );
}

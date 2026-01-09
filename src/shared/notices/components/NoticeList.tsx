import { Text2, Text1 } from "@/shared/ui/Text";
import type { Notice } from "../hooks/useNotices";

interface Props {
  notices: Notice[];
  onSelect: (notice: Notice) => void;
}

function formatDate(date?: Date) {
  if (!date) return "-";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export default function NoticeList({ notices, onSelect }: Props) {
  if (notices.length === 0) {
    return <Text2 text="공지사항이 없습니다." />;
  }

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <div
          key={notice.id}
          onClick={() => onSelect(notice)}
          className="border rounded p-3 pressable hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <Text2
              text={`${notice.pinned ? "📌 " : ""}${notice.title}`}
              className="font-medium"
            />
            <Text1
              text={formatDate(notice.createdAt)}
              className="text-gray-400"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

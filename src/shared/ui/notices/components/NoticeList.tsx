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
    // 콘텐츠 영역 높이가 고정되어 있으므로 안내 문구를 중앙에 둔다
    return (
      <div className="flex h-full items-center justify-center">
        <Text2 text="공지사항이 없습니다." className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <div
          key={notice.id}
          onClick={() => onSelect(notice)}
          className="border rounded p-3 pressable hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex justify-between items-center gap-2">
            <Text2
              text={`${notice.pinned ? "📌 " : ""}${notice.title}`}
              className="min-w-0 flex-1 truncate font-medium"
            />
            <Text1
              text={formatDate(notice.createdAt)}
              className="shrink-0 text-gray-400"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

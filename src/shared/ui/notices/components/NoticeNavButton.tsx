import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { Text1, Text2 } from "@/shared/ui/Text";
import type { Notice } from "../hooks/useNotices";

interface NoticeNavButtonProps {
  direction: "prev" | "next";
  notice: Notice;
  onSelect: (notice: Notice) => void;
}

/**
 * 상세 화면에서 이전/다음 공지로 이동하는 버튼.
 *
 * 한 줄을 모두 사용해 제목을 최대한 길게 보여준다.
 * 잘리는 경우를 대비해 aria-label 과 title 에 전체 제목을 담는다.
 */
export const NoticeNavButton = ({
  direction,
  notice,
  onSelect,
}: NoticeNavButtonProps) => {
  const label = direction === "prev" ? "이전" : "다음";
  const title = `${notice.pinned ? "📌 " : ""}${notice.title}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(notice)}
      aria-label={`${label} 공지: ${notice.title}`}
      className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left pressable hover:bg-gray-100"
    >
      <span className="shrink-0 text-gray-400">
        {direction === "prev" ? (
          <IoChevronUp size={14} />
        ) : (
          <IoChevronDown size={14} />
        )}
      </span>
      <Text1 text={label} className="shrink-0 text-gray-400" />
      <Text2 text={title} className="min-w-0 flex-1 truncate text-gray-600" />
    </button>
  );
};

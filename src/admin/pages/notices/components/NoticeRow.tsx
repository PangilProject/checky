import type { AdminNotice } from "../hooks/useAdminNotices";
import { formatDateDot } from "@/shared/utils/formatDate";


interface Props {
  notice: AdminNotice;
  onClick: () => void;
}

function NoticeRow({ notice, onClick }: Props) {
  return (
    <tr onClick={onClick} className="hover:bg-surface-hover cursor-pointer">
      <td className="px-4 py-2">{notice.pinned ? "고정" : "-"}</td>
      <td className="px-4 py-2">{notice.title}</td>
      <td className="px-4 py-2">{formatDateDot(notice.createdAt)}</td>
    </tr>
  );
}

export default NoticeRow;

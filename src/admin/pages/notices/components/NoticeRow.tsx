import type { AdminNotice } from "../hooks/useAdminNotices";

function formatDate(date?: Date) {
  if (!date) return "-";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

interface Props {
  notice: AdminNotice;
  onClick: () => void;
}

function NoticeRow({ notice, onClick }: Props) {
  return (
    <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 py-2">{notice.pinned ? "고정" : "-"}</td>
      <td className="px-4 py-2">{notice.title}</td>
      <td className="px-4 py-2">{formatDate(notice.createdAt)}</td>
    </tr>
  );
}

export default NoticeRow;

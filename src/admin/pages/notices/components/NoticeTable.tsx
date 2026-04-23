import { useState } from "react";
import type { AdminNotice } from "../hooks/useAdminNotices";
import NoticeRow from "./NoticeRow";
import NoticeModal from "./NoticeModal";

interface Props {
  notices: AdminNotice[];
  onSaved: () => Promise<void>;
}

function NoticeTable({ notices, onSaved }: Props) {
  const [selected, setSelected] = useState<AdminNotice | null>(null);

  return (
    <>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">고정 여부</th>
              <th className="px-4 py-2 text-left">제목</th>
              <th className="px-4 py-2 text-left">작성일</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <NoticeRow
                key={notice.id}
                notice={notice}
                onClick={() => setSelected(notice)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <NoticeModal
          mode="VIEW"
          notice={selected}
          onClose={() => setSelected(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}

export default NoticeTable;

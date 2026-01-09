import { useState } from "react";
import { Text5 } from "@/shared/ui/Text";
import { NormalBlackButton } from "@/shared/ui/Button";
import { useAdminNotices } from "./hooks/useAdminNotices";
import NoticeTable from "./components/NoticeTable";
import NoticeModal from "./components/NoticeModal";

function AdminNoticesPage() {
  const { notices, loading } = useAdminNotices();
  const [openCreate, setOpenCreate] = useState(false);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Text5 text="공지사항 관리" className="font-bold" />
        <NormalBlackButton
          text="공지 추가"
          onClick={() => setOpenCreate(true)}
        />
      </div>

      <NoticeTable notices={notices} />

      {openCreate && (
        <NoticeModal mode="CREATE" onClose={() => setOpenCreate(false)} />
      )}
    </div>
  );
}

export default AdminNoticesPage;

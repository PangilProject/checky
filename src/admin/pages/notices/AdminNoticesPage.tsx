import { useState } from "react";
import { Button } from "@/shared/ui/primitives";
import { AdminPageShell } from "@/admin/layout/AdminPageShell";
import { useAdminNotices } from "./hooks/useAdminNotices";
import NoticeTable from "./components/NoticeTable";
import NoticeModal from "./components/NoticeModal";

function AdminNoticesPage() {
  const { notices, loading, isError } = useAdminNotices();
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <AdminPageShell
      title="공지사항 관리"
      action={<Button onClick={() => setOpenCreate(true)}>공지 추가</Button>}
      loading={loading}
      isError={isError}
      errorText="공지사항을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요."
    >
      <NoticeTable notices={notices} />

      {openCreate && (
        <NoticeModal mode="CREATE" onClose={() => setOpenCreate(false)} />
      )}
    </AdminPageShell>
  );
}

export default AdminNoticesPage;

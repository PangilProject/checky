import { AdminPageShell } from "@/admin/layout/AdminPageShell";
import { useAdminUsers } from "./hooks/useAdminUsers";
import UserTable from "./components/UserTable";

function AdminUsersPage() {
  const { users, loading, isError } = useAdminUsers();

  return (
    <AdminPageShell
      title="가입자 관리"
      loading={loading}
      isError={isError}
      errorText="가입자 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요."
    >
      <UserTable users={users} />
    </AdminPageShell>
  );
}

export default AdminUsersPage;

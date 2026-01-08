import { Text5 } from "@/shared/ui/Text";
import { useAdminUsers } from "./hooks/useAdminUsers";
import UserTable from "./components/UserTable";

function AdminUsersPage() {
  const { users, loading } = useAdminUsers();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      <Text5 text="가입자 관리" className="font-bold" />
      <UserTable users={users} />
    </div>
  );
}

export default AdminUsersPage;

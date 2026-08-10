import { Text5 } from "@/shared/ui/Text";
import { useAdminUsers } from "./hooks/useAdminUsers";
import UserTable from "./components/UserTable";

function AdminUsersPage() {
  const { users, loading, isError } = useAdminUsers();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Text5 text="가입자 관리" className="font-bold" />
        <p className="text-sm text-content-muted">
          가입자 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Text5 text="가입자 관리" className="font-bold" />
      <UserTable users={users} />
    </div>
  );
}

export default AdminUsersPage;

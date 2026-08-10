import { Text } from "@/shared/ui/primitives";
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
        <Text variant="heading">가입자 관리</Text>
        <p className="text-sm text-content-muted">
          가입자 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Text variant="heading">가입자 관리</Text>
      <UserTable users={users} />
    </div>
  );
}

export default AdminUsersPage;

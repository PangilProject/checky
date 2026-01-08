import { useState } from "react";
import type { AdminUser } from "../hooks/useAdminUsers";
import UserRow from "./UserRow";
import UserDetailModal from "./UserDetailModal.tsx";

interface Props {
  users: AdminUser[];
}

function UserTable({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  return (
    <>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">이름</th>
              <th className="px-4 py-2 text-left">이메일</th>
              <th className="px-4 py-2 text-left">가입일</th>
              <th className="px-4 py-2 text-left">마지막 로그인</th>
              <th className="px-4 py-2 text-left">상태(7일)</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onClick={() => setSelectedUser(user)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}

export default UserTable;

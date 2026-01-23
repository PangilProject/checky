import type { AdminUser } from "../hooks/useAdminUsers";
import UserStatusBadge from "./UserStatusBadge";

interface Props {
  user: AdminUser;
  onClick: () => void;
  isActive: boolean;
}

function formatDate(date?: Date) {
  if (!date) return "-";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function UserRow({ user, onClick, isActive }: Props) {
  return (
    <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 py-2">{user.name ?? "-"}</td>
      <td className="px-4 py-2 hidden sm:table-cell">{user.email ?? "-"}</td>
      <td className="px-4 py-2">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-2">{formatDate(user.lastLoginAt)}</td>
      <td className="px-4 py-2">
        <UserStatusBadge isActive={isActive} />
      </td>
    </tr>
  );
}

export default UserRow;

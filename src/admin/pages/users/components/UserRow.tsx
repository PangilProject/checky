import type { AdminUser } from "../hooks/useAdminUsers";
import UserStatusBadge from "./UserStatusBadge";

interface Props {
  user: AdminUser;
  onClick: () => void;
}

function formatDate(date?: Date) {
  if (!date) return "-";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function UserRow({ user, onClick }: Props) {
  const STATUS_CONDITION = 3;
  const isActive =
    user.lastLoginAt &&
    user.lastLoginAt >=
      new Date(Date.now() - STATUS_CONDITION * 24 * 60 * 60 * 1000);

  return (
    <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 py-2">{user.name ?? "-"}</td>
      <td className="px-4 py-2">{user.email ?? "-"}</td>
      <td className="px-4 py-2">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-2">{formatDate(user.lastLoginAt)}</td>
      <td className="px-4 py-2">
        <UserStatusBadge isActive={Boolean(isActive)} />
      </td>
    </tr>
  );
}

export default UserRow;

import type { AdminUser } from "../hooks/useAdminUsers";
import UserStatusBadge from "./UserStatusBadge";
import { formatDateDot } from "@/shared/utils/formatDate";

interface Props {
  user: AdminUser;
  onClick: () => void;
  isActive: boolean;
}


function UserRow({ user, onClick, isActive }: Props) {
  return (
    <tr onClick={onClick} className="hover:bg-surface-hover cursor-pointer">
      <td className="px-4 py-2 whitespace-nowrap">{user.name ?? "-"}</td>
      <td className="px-4 py-2 whitespace-nowrap hidden sm:table-cell">{user.email ?? "-"}</td>
      <td className="px-4 py-2 whitespace-nowrap">{formatDateDot(user.createdAt)}</td>
      <td className="px-4 py-2 whitespace-nowrap hidden sm:table-cell">
        {formatDateDot(user.lastLoginAt)}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">{formatDateDot(user.lastActiveAt)}</td>
      <td className="px-4 py-2 whitespace-nowrap">
        <UserStatusBadge isActive={isActive} />
      </td>
    </tr>
  );
}

export default UserRow;

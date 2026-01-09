import { useMemo, useState } from "react";
import type { AdminUser } from "../hooks/useAdminUsers";
import UserRow from "./UserRow";
import UserDetailModal from "./UserDetailModal";

type SortKey = "name" | "createdAt" | "lastLoginAt" | "status";
type SortOrder = "asc" | "desc";

interface Props {
  users: AdminUser[];
}

const STATUS_CONDITION = 3; // 3일 기준

function UserTable({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortKey) {
        case "name": {
          aValue = (a.name ?? "").toLowerCase();
          bValue = (b.name ?? "").toLowerCase();
          break;
        }

        case "createdAt": {
          aValue = a.createdAt
            ? a.createdAt.getTime()
            : Number.MAX_SAFE_INTEGER;
          bValue = b.createdAt
            ? b.createdAt.getTime()
            : Number.MAX_SAFE_INTEGER;
          break;
        }

        case "lastLoginAt": {
          aValue = a.lastLoginAt
            ? a.lastLoginAt.getTime()
            : Number.MAX_SAFE_INTEGER;
          bValue = b.lastLoginAt
            ? b.lastLoginAt.getTime()
            : Number.MAX_SAFE_INTEGER;
          break;
        }

        case "status": {
          const aActive =
            a.lastLoginAt &&
            a.lastLoginAt >=
              new Date(Date.now() - STATUS_CONDITION * 24 * 60 * 60 * 1000);

          const bActive =
            b.lastLoginAt &&
            b.lastLoginAt >=
              new Date(Date.now() - STATUS_CONDITION * 24 * 60 * 60 * 1000);

          // 🔑 핵심: boolean → number
          aValue = aActive ? 1 : 0;
          bValue = bActive ? 1 : 0;
          break;
        }

        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortKey, sortOrder]);

  const renderHeader = (label: string, key: SortKey) => {
    const isActive = sortKey === key;

    const arrow = isActive ? (sortOrder === "asc" ? "▲" : "▼") : "▼";

    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        className={`
        flex items-center gap-1
        font-medium
        transition-colors
        ${isActive ? "text-black" : "text-gray-400 hover:text-gray-600"}
      `}
      >
        {label}
        <span
          className={`
          text-xs transition-colors
          ${isActive ? "text-black" : "text-gray-300"}
        `}
        >
          {arrow}
        </span>
      </button>
    );
  };
  return (
    <>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">
                {renderHeader("이름", "name")}
              </th>
              <th className="px-4 py-2 text-left hidden sm:table-cell">
                이메일
              </th>
              <th className="px-4 py-2 text-left">
                {renderHeader("가입일", "createdAt")}
              </th>
              <th className="px-4 py-2 text-left">
                {renderHeader("마지막 로그인", "lastLoginAt")}
              </th>
              <th className="px-4 py-2 text-left">
                {renderHeader("상태(3일)", "status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
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

import { useEffect, useMemo, useState } from "react";
import type { AdminUser } from "../hooks/useAdminUsers";
import UserRow from "./UserRow";
import UserDetailModal from "./UserDetailModal";

type SortKey =
  | "name"
  | "createdAt"
  | "lastLoginAt"
  | "lastActiveAt"
  | "status";
type SortOrder = "asc" | "desc";

interface Props {
  users: AdminUser[];
}

const STATUS_CONDITION = 3; // 3일 기준
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 활성 여부는 마지막 접속 기준으로 판단한다.
 * 마지막 로그인은 구글 인증을 다시 수행할 때만 갱신되므로,
 * 세션이 유지되는 동안 계속 사용하는 사용자가 비활성으로 잡힌다.
 */
const isActiveUser = (user: AdminUser, nowTime: number) =>
  Boolean(
    user.lastActiveAt &&
      user.lastActiveAt.getTime() >= nowTime - STATUS_CONDITION * DAY_MS
  );

/** 컬럼을 처음 눌렀을 때의 정렬 방향. 날짜와 상태는 최신·활성이 먼저 보이는 게 유용하다. */
const DEFAULT_SORT_ORDER: Record<SortKey, SortOrder> = {
  name: "asc",
  createdAt: "desc",
  lastLoginAt: "desc",
  lastActiveAt: "desc",
  status: "desc",
};

/** 정렬 기준값. 값이 없으면 null 을 반환해 항상 뒤로 보낸다. */
const getSortValue = (
  user: AdminUser,
  key: SortKey,
  nowTime: number
): string | number | null => {
  switch (key) {
    case "name":
      return (user.name ?? "").toLowerCase();
    case "createdAt":
      return user.createdAt?.getTime() ?? null;
    case "lastLoginAt":
      return user.lastLoginAt?.getTime() ?? null;
    case "lastActiveAt":
      return user.lastActiveAt?.getTime() ?? null;
    case "status":
      return isActiveUser(user, nowTime) ? 1 : 0;
  }
};

const compareValues = (a: string | number, b: string | number) =>
  typeof a === "string" && typeof b === "string"
    ? a.localeCompare(b, "ko")
    : Number(a) - Number(b);

function UserTable({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // 활성 판정의 기준 시각. 모듈 스코프에 고정하면 탭을 열어 둔 만큼
  // "3일 내 활성" 판정이 통째로 밀리므로, 마운트 시점에 잡고
  // 오래 열어 둔 탭을 위해 주기적으로 갱신한다. 판정 단위가 '일'이라
  // 한 시간 간격이면 충분하다.
  const [nowTime, setNowTime] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowTime(Date.now()), 60 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  // 실사용 파악이 목적이므로 최근 접속한 사용자가 먼저 보이도록 한다
  const [sortKey, setSortKey] = useState<SortKey>("lastActiveAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder(DEFAULT_SORT_ORDER[key]);
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aValue = getSortValue(a, sortKey, nowTime);
      const bValue = getSortValue(b, sortKey, nowTime);

      // 기록이 없는 사용자는 정렬 방향과 무관하게 항상 뒤로 보낸다.
      // 최신순 정렬에서 기록 없는 사용자가 맨 위로 올라오면 목록이 무의미해진다.
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      const diff = compareValues(aValue, bValue);
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [users, sortKey, sortOrder, nowTime]);

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
        ${isActive ? "text-content" : "text-content-muted hover:text-content-muted"}
      `}
      >
        {label}
        <span
          className={`
          text-xs transition-colors
          ${isActive ? "text-content" : "text-content-subtle"}
        `}
        >
          {arrow}
        </span>
      </button>
    );
  };
  return (
    <>
      <div className="bg-surface-raised border border-line rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-sunken text-content-muted">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                {renderHeader("이름", "name")}
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap hidden sm:table-cell">
                이메일
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                {renderHeader("가입일", "createdAt")}
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap hidden sm:table-cell">
                {renderHeader("마지막 로그인", "lastLoginAt")}
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                {renderHeader("마지막 접속", "lastActiveAt")}
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                {renderHeader("상태(3일)", "status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isActive={isActiveUser(user, nowTime)}
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

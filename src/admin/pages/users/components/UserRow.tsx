import type { AdminUser } from "../hooks/useAdminUsers";
import UserStatusBadge from "./UserStatusBadge";
import { formatDateDot } from "@/shared/utils/formatDate";

interface Props {
  user: AdminUser;
  onClick: () => void;
  isActive: boolean;
}


/**
 * 가입자 한 줄.
 *
 * name 과 email 은 사용자가 임의로 정할 수 있는 값이다(구글 계정 이름을 바꾸거나
 * SDK 로 자기 문서를 직접 고칠 수 있다). 이 앱에서 한 사용자의 입력이 다른 사람의
 * 화면에 도달하는 유일한 경로이므로, 값을 그대로 자식으로만 넘긴다.
 * HTML 로 해석하는 순간 저장돼 있던 문자열이 관리자 브라우저에서 실행된다.
 */
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

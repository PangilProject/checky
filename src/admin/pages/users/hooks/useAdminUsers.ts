import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { adminKeys } from "@/shared/api/keys";

export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  createdAt?: Date;
  /** 구글 인증을 실제로 수행한 시각 */
  lastLoginAt?: Date;
  /** 세션으로 앱을 연 시각 (실사용 기준) */
  lastActiveAt?: Date;
}

const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  // 서버 orderBy 를 쓰지 않는다. Firestore 는 정렬 필드가 없는 문서를
  // 결과에서 빼므로, name 이 없는 사용자가 관리자 목록에서 통째로 사라진다.
  // 관리 목적의 목록은 빠짐없이 보이는 쪽이 중요하므로 여기서 정렬한다.
  const snap = await getDocs(collection(db, "users"));

  return snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt?.toDate?.(),
        lastLoginAt: data.lastLoginAt?.toDate?.(),
        lastActiveAt: data.lastActiveAt?.toDate?.(),
      };
    })
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "ko"));
};

/**
 * 관리자 사용자 목록을 읽는다.
 *
 * users 컬렉션 전체를 읽는 비싼 조회라 React Query 로 캐시해,
 * 대시보드와 목록을 오갈 때마다 다시 스캔하지 않는다.
 * 사용자 수가 늘면 limit + 페이지네이션이 필요하다(화면 사양 결정 필요).
 */
export const useAdminUsers = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchAdminUsers,
  });

  return { users: data ?? [], loading: isLoading, isError };
};

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore/lite";
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
  const q = query(
    collection(db, "users"),
    orderBy("name", "asc") // 🔹 이름 오름차순
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt?.toDate?.(),
      lastLoginAt: data.lastLoginAt?.toDate?.(),
      lastActiveAt: data.lastActiveAt?.toDate?.(),
    };
  });
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

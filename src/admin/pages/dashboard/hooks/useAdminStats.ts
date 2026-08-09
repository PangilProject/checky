import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  type DocumentData,
} from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";
import { adminKeys } from "@/shared/api/keys";
import { formatDateToYmd } from "@/shared/hooks/formatDate";

interface ChartItem {
  date: string;
  count: number;
}

interface AdminStats {
  totalUsers: number;
  todayUsers: number;
  weeklyUsers: number;
  activeUsers: number;

  todayActiveUsers: number;
  inactiveUsers: number;

  signupByDate: ChartItem[];
  activeByDate: ChartItem[];
}

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  todayUsers: 0,
  weeklyUsers: 0,
  activeUsers: 0,
  todayActiveUsers: 0,
  inactiveUsers: 0,
  signupByDate: [],
  activeByDate: [],
};

const labelFromKey = (dateKey: string) => {
  const [, m, d] = dateKey.split("-");
  return `${Number(m)}/${Number(d)}`;
};

/**
 * users 컬렉션 전체에서 대시보드 지표를 만든다.
 *
 * 가입·활성 추이 차트가 전 기간을 그리므로 전체 스캔이 필요하다.
 * 기간을 잘라 읽으면 차트에 보이는 범위가 줄어드는 화면 사양 변경이라,
 * 사용자 수가 늘어 스캔이 부담되면 그때 기간 윈도잉을 논의한다.
 */
const fetchAdminStats = async (): Promise<AdminStats> => {
  const usersSnap = await getDocs(collection(db, "users"));
  const users: DocumentData[] = usersSnap.docs.map((doc) => doc.data());

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const signupMap = new Map<string, number>();
  const activeMap = new Map<string, number>();

  let todayUsers = 0;
  let weeklyUsers = 0;
  let activeUsers = 0;
  let todayActiveUsers = 0;

  users.forEach((user) => {
    const createdAt = user.createdAt?.toDate?.();
    // 활성 지표는 실사용을 나타내는 마지막 접속 기준으로 집계한다.
    // 마지막 로그인은 구글 인증을 다시 수행할 때만 갱신되어 실사용과 어긋난다.
    const lastActiveAt = user.lastActiveAt?.toDate?.();

    if (createdAt) {
      if (createdAt >= startOfToday) todayUsers++;
      if (createdAt >= startOfWeek) weeklyUsers++;

      const key = formatDateToYmd(createdAt);
      signupMap.set(key, (signupMap.get(key) ?? 0) + 1);
    }

    if (lastActiveAt) {
      if (lastActiveAt >= startOfWeek) activeUsers++;
      if (lastActiveAt >= startOfToday) todayActiveUsers++;

      const key = formatDateToYmd(lastActiveAt);
      activeMap.set(key, (activeMap.get(key) ?? 0) + 1);
    }
  });

  const signupByDate = Array.from(signupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: labelFromKey(date), count }));

  const activeByDate = Array.from(activeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: labelFromKey(date), count }));

  return {
    totalUsers: users.length,
    todayUsers,
    weeklyUsers,
    activeUsers,
    todayActiveUsers,
    inactiveUsers: users.length - activeUsers,
    signupByDate,
    activeByDate,
  };
};

/**
 * 관리자 대시보드 지표를 읽는다.
 *
 * 전체 스캔이라 React Query 로 캐시해, 대시보드를 다시 열 때마다
 * users 컬렉션을 재스캔하지 않는다.
 */
export const useAdminStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: fetchAdminStats,
  });

  return { stats: data ?? EMPTY_STATS, loading: isLoading, isError };
};

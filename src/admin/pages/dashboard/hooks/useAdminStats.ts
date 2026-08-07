import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  type DocumentData,
} from "firebase/firestore/lite";
import { db } from "@/firebase/firebase";

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

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const labelFromKey = (dateKey: string) => {
  const [, m, d] = dateKey.split("-");
  return `${Number(m)}/${Number(d)}`;
};

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    todayUsers: 0,
    weeklyUsers: 0,
    activeUsers: 0,
    todayActiveUsers: 0,
    inactiveUsers: 0,
    signupByDate: [],
    activeByDate: [],
  });

  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setIsError(false);

      let users: DocumentData[] = [];
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        users = usersSnap.docs.map((doc) => doc.data());
      } catch {
        setIsError(true);
        setLoading(false);
        return;
      }

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

          const key = toDateKey(createdAt);
          signupMap.set(key, (signupMap.get(key) ?? 0) + 1);
        }

        if (lastActiveAt) {
          if (lastActiveAt >= startOfWeek) activeUsers++;
          if (lastActiveAt >= startOfToday) todayActiveUsers++;

          const key = toDateKey(lastActiveAt);
          activeMap.set(key, (activeMap.get(key) ?? 0) + 1);
        }
      });

      const signupByDate = Array.from(signupMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date: labelFromKey(date), count }));

      const activeByDate = Array.from(activeMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date: labelFromKey(date), count }));

      setStats({
        totalUsers: users.length,
        todayUsers,
        weeklyUsers,
        activeUsers,
        todayActiveUsers,
        inactiveUsers: users.length - activeUsers,
        signupByDate,
        activeByDate,
      });

      setLoading(false);
    };

    void fetchStats();
  }, []);

  return { stats, loading, isError };
};

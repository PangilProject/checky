import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore/lite";
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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map((doc) => doc.data());

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
        const lastLoginAt = user.lastLoginAt?.toDate?.();

        if (createdAt) {
          if (createdAt >= startOfToday) todayUsers++;
          if (createdAt >= startOfWeek) weeklyUsers++;

          const key = toDateKey(createdAt);
          signupMap.set(key, (signupMap.get(key) ?? 0) + 1);
        }

        if (lastLoginAt) {
          if (lastLoginAt >= startOfWeek) activeUsers++;
          if (lastLoginAt >= startOfToday) todayActiveUsers++;

          const key = toDateKey(lastLoginAt);
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

    fetchStats();
  }, []);

  return { stats, loading };
};

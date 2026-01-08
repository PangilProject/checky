import StatCard from "./StatCard";

interface DashboardGridProps {
  stats: {
    totalUsers: number;
    todayUsers: number;
    weeklyUsers: number;
    activeUsers: number;
  };
}

function DashboardGrid({ stats }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard title="전체 가입자 수" value={stats.totalUsers} />
      <StatCard title="오늘 신규 가입자" value={stats.todayUsers} />
      <StatCard title="이번 주 신규 가입자" value={stats.weeklyUsers} />
      <StatCard title="최근 7일 활성 사용자" value={stats.activeUsers} />
    </div>
  );
}

export default DashboardGrid;

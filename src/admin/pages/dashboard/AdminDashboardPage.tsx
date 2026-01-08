import { Text5 } from "@/shared/ui/Text";
import { Space10 } from "@/shared/ui/Space";
import { useAdminStats } from "./hooks/useAdminStats";
import DashboardGrid from "./components/DashboardGrid";
import UserSignupChart from "./components/UserSignupChart";
import ActiveUserChart from "./components/ActiveUserChart";
import SectionTitle from "./components/SectionTitle";

function AdminDashboardPage() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <Text5 text="관리자 대시보드" className="font-bold" />

      <DashboardGrid stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionTitle title="가입자 추이" description="최근 가입자 변화 추이" />
        <UserSignupChart data={stats.signupByDate} />

        <SectionTitle
          title="활성 사용자 추이"
          description="최근 7일 로그인 기준"
        />
        <ActiveUserChart data={stats.activeByDate} />
      </div>

      <Space10 direction="mb" />
    </div>
  );
}

export default AdminDashboardPage;

import { Stack, Text } from "@/shared/ui/primitives";
import { useAdminStats } from "./hooks/useAdminStats";
import DashboardGrid from "./components/DashboardGrid";
import UserSignupChart from "./components/UserSignupChart";
import ActiveUserChart from "./components/ActiveUserChart";
import SectionTitle from "./components/SectionTitle";

function AdminDashboardPage() {
  const { stats, loading, isError } = useAdminStats();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Text variant="heading">관리자 대시보드</Text>
        <p className="text-sm text-content-muted">
          통계를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Text variant="heading">관리자 대시보드</Text>

      <DashboardGrid stats={stats} />

      {/* 차트 섹션 */}
      <Stack gap={6} direction="col" className="xl:flex-row">
        {/* 가입자 추이 */}
        <div className="flex-1">
          <SectionTitle
            title="가입자 추이"
            description="최근 가입자 변화 추이"
          />
          <UserSignupChart data={stats.signupByDate} />
        </div>

        {/* 활성 사용자 추이 */}
        <div className="flex-1">
          {/*
            이 차트는 사용자별 "마지막 접속일"을 날짜별로 센 분포다.
            한 사용자는 한 날짜에만 잡히므로 날짜별 접속자 수(DAU)가 아니다.
            오해를 막기 위해 그리는 내용대로 이름을 붙인다.
          */}
          <SectionTitle
            title="마지막 접속일 분포"
            description="사용자별 마지막 접속일 기준"
          />
          <ActiveUserChart data={stats.activeByDate} />
        </div>
      </Stack>
    </div>
  );
}

export default AdminDashboardPage;

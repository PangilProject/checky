import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { useMinimumLoading } from "@/shared/hooks/useMinimumLoading";
import LoadingPage from "@/pages/LoadingPage/LoadingPage";
import { LoginSection } from "./components/LoginSection";

function LoginPage() {
  const { user, isLoading } = useAuth();
  const showLoading = useMinimumLoading(isLoading);

  // 이미 로그인된 사용자는 로그인 화면을 그리지 않고 바로 이동시킨다.
  // 직접 useEffect 에서 navigate 를 호출하면 effect 가 화면을 그린 뒤에 실행되어
  // 로그인 화면이 한 프레임 노출된다.
  // Navigate 도 내부적으로 effect 로 이동하므로, 그 한 프레임을 빈 화면이 아닌
  // 로딩 화면으로 채워 앞뒤 로딩과 이어지게 한다.
  if (user) {
    return (
      <>
        <Navigate to="/home" replace />
        <LoadingPage />
      </>
    );
  }

  if (showLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <LoginSection />
    </div>
  );
}

export default LoginPage;

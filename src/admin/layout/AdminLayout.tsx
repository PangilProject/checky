import { Navigate, Outlet, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import LoadingPage from "@/pages/LoadingPage/LoadingPage";
import { useAuth } from "@/shared/hooks/useAuth";
import { Space10 } from "@/shared/ui/Space";
import { useEffect } from "react";

function AdminLayout() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  // 🔹 관리자 권한 없음 처리
  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      alert("관리자 권한이 없습니다.");
      navigate("/", { replace: true });
    }
  }, [isLoading, user, isAdmin, navigate]);

  // 🔹 로딩 중
  if (isLoading) {
    return <LoadingPage />;
  }

  // 🔹 로그인 안 됨
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🔹 로그인은 했지만 관리자 아님 (alert 후 이동 중)
  if (!isAdmin) {
    return null;
  }

  // 🔹 관리자 정상 접근
  return (
    <div className="w-full flex flex-col items-center px-2">
      <div className="w-full max-w-200 flex flex-col">
        <AdminHeader />
        <Space10 direction="mb" />
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;

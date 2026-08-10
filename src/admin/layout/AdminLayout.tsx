import { Navigate, Outlet, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import LoadingPage from "@/pages/LoadingPage/LoadingPage";
import { useAuth } from "@/shared/hooks/useAuth";
import { useMinimumLoading } from "@/shared/hooks/useMinimumLoading";
import { useEffect } from "react";
import { toast } from "react-toastify";

function AdminLayout() {
  const { user, isAdmin, isLoading, isAdminLoading } = useAuth();
  // 관리자 여부는 인증 확인보다 늦게 도착하므로 두 확인이 모두 끝날 때까지 기다린다.
  // 기다리지 않으면 조회가 끝나기 전에 관리자를 권한 없음으로 판단해 내보내게 된다.
  const isAuthResolving = isLoading || isAdminLoading;
  const showLoading = useMinimumLoading(isAuthResolving);
  const navigate = useNavigate();

  // 🔹 관리자 권한 없음 처리
  useEffect(() => {
    if (!isAuthResolving && user && !isAdmin) {
      toast.error("관리자 권한이 없습니다.");
      navigate("/", { replace: true });
    }
  }, [isAuthResolving, user, isAdmin, navigate]);

  // 🔹 로딩 중 (실제 로딩이 끝나도 최소 표시 시간 동안 유지)
  if (showLoading) {
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
      <div className="w-full max-w-200 flex flex-col gap-10">
        <AdminHeader />
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;

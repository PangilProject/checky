import { Navigate, Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import LoadingPage from "@/pages/LoadingPage/LoadingPage";
import { useAuth } from "@/shared/hooks/useAuth";
import { Space10 } from "@/shared/ui/Space";

function AdminLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }
  return user ? (
    <div className="w-full flex flex-col items-center px-2">
      {/* <div className="w-full max-w-[800px] flex flex-col "> */}
      <div className="w-full max-w-200 flex flex-col ">
        <AdminHeader />
        <Space10 direction="mb" />
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}

export default AdminLayout;

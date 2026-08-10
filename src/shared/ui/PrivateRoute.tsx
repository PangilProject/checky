import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { useMinimumLoading } from "@/shared/hooks/useMinimumLoading";
import LoadingPage from "../../pages/LoadingPage/LoadingPage";
import Header from "./Header";

function PrivateRoute() {
  const { user, isLoading } = useAuth();
  const showLoading = useMinimumLoading(isLoading);

  if (showLoading) {
    return <LoadingPage />;
  }

  return user ? (
    <div className="w-full flex flex-col items-center px-2">
      {/* <div className="w-full max-w-[800px] flex flex-col "> */}
      <div className="w-full max-w-200 flex flex-col gap-10">
        <Header />
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}

export default PrivateRoute;

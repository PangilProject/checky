import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import LoadingPage from "../../pages/LoadingPage/LoadingPage";
import Header from "./Header";
import { Space10 } from "./Space";

function PrivateRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return user ? (
    <div className="w-full flex flex-col items-center px-2">
      <div className="w-full max-w-[1000px] flex flex-col ">
        <Header />
        <Space10 direction="mb" />
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}

export default PrivateRoute;

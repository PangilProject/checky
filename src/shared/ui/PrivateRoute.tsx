import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import LoadingPage from "../../pages/LoadingPage/LoadingPage";
import Header from "./Header";

function PrivateRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return user ? (
    <div className="w-full flex flex-col items-center">
      <div className="w-[1000px] flex flex-col bg-gray-200">
        <Header />
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}

export default PrivateRoute;

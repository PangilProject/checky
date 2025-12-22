import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import LoadingPage from "../../pages/LoadingPage/LoadingPage";

function PrivateRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
}

export default PrivateRoute;

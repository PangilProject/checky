import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { useMinimumLoading } from "@/shared/hooks/useMinimumLoading";
import LoadingPage from "@/pages/LoadingPage/LoadingPage";
import { LoginSection } from "./components/LoginSection";

function LoginPage() {
  const { user, isLoading } = useAuth();
  const showLoading = useMinimumLoading(isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, isLoading, navigate]);

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

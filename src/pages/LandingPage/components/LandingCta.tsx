import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, cn } from "@/shared/ui/primitives";
import { LegalConsentNotice } from "@/shared/ui/LegalLinks";
import { getLoginErrorMessage } from "@/pages/LoginPage/utils/getLoginErrorMessage";

/**
 * 이야기의 끝에 여는 시작하기 버튼.
 *
 * 로그인 화면(LoginSection)과 같은 흐름이지만, 인증 SDK 는 누르는 순간에 불러온다.
 * 랜딩을 끝까지 보지 않고 떠나는 방문자까지 그 용량을 받을 필요는 없다.
 * 가입 시점 고지(LegalConsentNotice)는 로그인 화면과 똑같이 버튼 아래에 둔다.
 */
export const LandingCta = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const { signInWithGoogle } = await import("@/shared/api/auth/auth");
      await signInWithGoogle();
      navigate("/home", { replace: true });
    } catch (error) {
      const message = getLoginErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={cn("flex w-full flex-col items-center gap-4", className)}>
      <Button size="lg" disabled={isLoggingIn} onClick={() => void handleLogin()}>
        {isLoggingIn ? "로그인 중..." : "Google로 Checky 시작하기 →"}
      </Button>
      <LegalConsentNotice />
    </div>
  );
};

import { useState } from "react";
import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { useNavigate } from "react-router-dom";
import { Button, Text } from "@/shared/ui/primitives";
import { signInWithGoogle } from "@/shared/api/auth/auth";
import { LegalConsentNotice } from "@/shared/ui/LegalLinks";
import { toast } from "react-toastify";
import { getLoginErrorMessage } from "../utils/getLoginErrorMessage";

export const LoginSection = () => {
  return (
    <>
      <ServiceTitle />
      <ServiceDesc />
      <ServiceLogo />
      <LoginButton />
    </>
  );
};

const ServiceTitle = () => {
  return <p className={`mb-4 text-4xl ${wickedMouseClass}`}>CHECKY</p>;
};

const ServiceDesc = () => {
  return (
    <Text variant="body" className="mb-10">
      어제 보다 더 나은 오늘을 위해
    </Text>
  );
};

const ServiceLogo = () => {
  const logoSrc = useLogoSrc("round");

  return <img src={logoSrc} alt="checky 로고" className="mb-12 w-15 h-15" />;
};

const LoginButton = () => {
  const navigate = useNavigate();
  // 연속 클릭으로 팝업이 중복 열려 로그인이 취소되는 것을 막는다
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
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
    <div className="flex w-full flex-col max-w-200 items-center">
      <Button
        size="none"
        onClick={() => void handleLogin()}
        disabled={isLoggingIn}
        className="w-50 h-10"
      >
        {isLoggingIn ? "로그인 중..." : "Google로 시작하기"}
      </Button>
      <div className="mt-4">
        <LegalConsentNotice />
      </div>
    </div>
  );
};

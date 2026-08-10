import { useState } from "react";
import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { LongBlackButton } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { Text3 } from "@/shared/ui/Text";
import { Space10, Space12, Space4 } from "@/shared/ui/Space";
import { signInWithGoogle } from "@/shared/api/auth/auth";
import { LegalConsentNotice } from "@/shared/ui/LegalLinks";
import { toast } from "react-toastify";

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
  return (
    <>
      <p className={`text-4xl ${wickedMouseClass}`}>CHECKY</p>
      <Space4 direction="mb" />
    </>
  );
};

const ServiceDesc = () => {
  return (
    <>
      <Text3 text="어제 보다 더 나은 오늘을 위해" />
      <Space10 direction="mb" />
    </>
  );
};

const ServiceLogo = () => {
  const logoSrc = useLogoSrc("round");

  return (
    <>
      <img src={logoSrc} alt="checky 로고" className="w-15 h-15" />
      <Space12 direction="mb" />
    </>
  );
};

/** 로그인 실패 원인별 안내 문구를 반환합니다. */
const getLoginErrorMessage = (error: unknown): string | null => {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    // 사용자가 스스로 창을 닫은 경우는 오류가 아니므로 알리지 않는다
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/popup-blocked":
      return "팝업이 차단되었어요. 브라우저 팝업 허용 후 다시 시도해 주세요.";
    case "auth/network-request-failed":
      return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
    case "auth/account-exists-with-different-credential":
      return "다른 방식으로 가입된 계정이에요. 기존 로그인 방식을 사용해 주세요.";
    default:
      return "로그인에 실패했어요. 다시 시도해 주세요.";
  }
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
      <LongBlackButton
        text={isLoggingIn ? "로그인 중..." : "Google로 시작하기"}
        onClick={() => void handleLogin()}
        disabled={isLoggingIn}
        width="w-50"
        height="h-10"
      />
      <Space4 direction="mb" />
      <LegalConsentNotice />
    </div>
  );
};

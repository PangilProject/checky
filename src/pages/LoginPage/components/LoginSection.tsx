import { useState } from "react";
import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { Link, useNavigate } from "react-router-dom";
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
      <IntroLink />
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

  // 로고를 누르면 소개로 간다는 관례를 따른다. 누를 수 있다는 표시가 없어
  // 키보드 순서에서는 빼고, 같은 곳으로 가는 길은 아래 IntroLink 가 맡는다
  return (
    <Link to="/" tabIndex={-1} className="mb-12">
      <img src={logoSrc} alt="checky 로고" className="w-15 h-15" />
    </Link>
  );
};

/**
 * 소개 페이지로 가는 길.
 *
 * 소개에서 시작하기를 눌러 온 사람은 뒤로 가기로 돌아갈 수 있지만,
 * 공유받은 링크나 로그아웃으로 이 화면에 먼저 닿은 사람은 소개가 있는지 모른다.
 * 가입 고지는 버튼 바로 아래에 붙어 있어야 하므로 그 아래에 둔다.
 */
const IntroLink = () => {
  return (
    <Link
      to="/"
      className="mt-10 text-sm text-content-muted underline-offset-2 hover:text-content hover:underline pressable"
    >
      Checky가 처음이라면 둘러보기 →
    </Link>
  );
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

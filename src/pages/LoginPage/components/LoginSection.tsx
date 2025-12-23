import { wickedMouseClass } from "@/styles/font";
import LogoImage from "../../../assets/images/logoRound.png";
import { LongBlackButton } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "@/services/firebase/auth";
import { Text3 } from "@/shared/ui/Text";
import { Space10, Space12, Space4 } from "@/shared/ui/Space";

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
  return (
    <>
      <img src={LogoImage} className="w-15 h-15" />
      <Space12 direction="mb" />
    </>
  );
};

const LoginButton = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/home");
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("로그인에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="flex w-full flex-col max-w-[1000px] items-center">
      <LongBlackButton
        text="Google로 시작하기"
        onClick={handleLogin}
        width="w-50"
        height="h-10"
      />
    </div>
  );
};

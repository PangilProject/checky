import { wickedMouseStyle } from "@/styles/font";
import LogoImage from "../../../assets/images/logo.png";
import { FillButton } from "@/shared/ui/Button";

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
    <p style={wickedMouseStyle} className="text-4xl mb-4">
      CHECKY
    </p>
  );
};

const ServiceDesc = () => {
  return (
    <p className="text-sm tracking-tight opacity-80 text-base mb-12">
      어제 보다 더 나은 오늘을 위해
    </p>
  );
};

const ServiceLogo = () => {
  return <img src={LogoImage} className="w-15 h-15 mb-12" />;
};

const LoginButton = () => {
  return (
    <div className="flex w-full flex-col max-w-[1000px] items-center">
      <FillButton
        text="시작하기"
        className="text-white bg-black hover:opacity-50"
      />
    </div>
  );
};

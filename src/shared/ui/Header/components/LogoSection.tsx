import { Link } from "react-router-dom";
import { Space2 } from "../../Space";
import { Text4, Text6 } from "../../Text";
import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";

export const LogoSection = () => {
  const logoSrc = useLogoSrc();

  return (
    // 헤더는 로그인 상태에서만 노출되므로 홈으로 바로 보낸다.
    // "/" 는 로그인 페이지라 인증 확인과 리다이렉트를 거치며 로딩 화면이 노출된다.
    <Link to="/home">
      <div className="flex items-center my-3 sm:my-4">
        <img src={logoSrc} className="w-6 sm:w-8" />
        <Space2 direction="mr" />
        <Text4
          className={`block sm:hidden ${wickedMouseClass}`}
          text="CHECKY"
        />
        <Text6
          className={`hidden sm:block ${wickedMouseClass}`}
          text="CHECKY"
        />
      </div>
    </Link>
  );
};

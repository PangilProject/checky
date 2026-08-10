import { Link } from "react-router-dom";
import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { Stack } from "@/shared/ui/primitives";

export const LogoSection = () => {
  const logoSrc = useLogoSrc();

  return (
    // 헤더는 로그인 상태에서만 노출되므로 홈으로 바로 보낸다.
    // "/" 는 로그인 페이지라 인증 확인과 리다이렉트를 거치며 로딩 화면이 노출된다.
    <Link to="/home">
      <Stack gap={2} direction="row" align="center" className="my-3 sm:my-4">
        <img src={logoSrc} className="w-6 sm:w-8" />
        <span className={`block text-lg sm:hidden ${wickedMouseClass}`}>
          CHECKY
        </span>
        <span className={`hidden text-2xl sm:block ${wickedMouseClass}`}>
          CHECKY
        </span>
      </Stack>
    </Link>
  );
};

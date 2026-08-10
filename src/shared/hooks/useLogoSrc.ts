import logo from "@/assets/images/logo.png";
import logoWhite from "@/assets/images/logo-white.png";
import logoRound from "@/assets/images/logoRound.png";
import logoRoundWhite from "@/assets/images/logoRound-white.png";
import { useTheme } from "./useTheme";

/**
 * 테마에 맞는 로고 경로를 돌려준다.
 *
 * 로고는 그림이라 CSS 토큰으로 색을 바꿀 수 없으므로, 어두운 배경용 파일을 따로 쓴다.
 * 컴포넌트가 아니라 경로를 돌려주는 이유는, 프로필 사진이 없을 때의 대체 이미지처럼
 * src 문자열 자체가 필요한 자리가 있기 때문이다.
 *
 * plain: 헤더에 쓰는 기본 로고 / round: 둥근 로고
 */
export const useLogoSrc = (shape: "plain" | "round" = "plain") => {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  if (shape === "round") return isDark ? logoRoundWhite : logoRound;
  return isDark ? logoWhite : logo;
};

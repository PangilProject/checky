/**
 * 랜딩 필름에 나오는 로고와 워드마크의 겉모습.
 * 클래스는 Header/components/LogoSection.tsx, LoginPage/components/LoginSection.tsx 에서 그대로 가져왔다. 원본이 바뀌면 함께 고친다.
 */
import { cn } from "@/shared/ui/primitives";
import { wickedMouseClass } from "@/styles/font";
import logoRoundWhite from "@/assets/images/logoRound-white.png";
import logoWhite from "@/assets/images/logo-white.png";

/**
 * CHECKY 워드마크 (Header 의 LogoSection, 로그인 화면).
 * ⚠️ Wicked Mouse 는 Demo 판 글꼴이다. 라이선스를 확인하기 전까지는
 * 기존 화면과 같은 이 한 자리에만 쓰고 본문 글꼴로 넓히지 않는다.
 */
export const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn("block whitespace-nowrap leading-none", wickedMouseClass, className)}>
    CHECKY
  </span>
);

/**
 * 로고 그림. 흰 그림 한 벌을 두고 라이트 테마에서만 뒤집어 검게 칠한다.
 * 검은 원본(logoRound.png)은 134px 라 크게 그리면 흐려지고,
 * 흰 원본은 322px 라 랜딩의 큰 캐릭터에도 버틴다.
 */
export const LogoImage = ({
  shape,
  className,
}: {
  shape: "round" | "plain";
  className?: string;
}) => (
  <img
    src={shape === "round" ? logoRoundWhite : logoWhite}
    alt=""
    draggable={false}
    className={cn("block h-full w-full invert transition-[filter] duration-500 dark:invert-0", className)}
  />
);

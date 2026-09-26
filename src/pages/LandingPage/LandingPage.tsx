import { Navigate } from "react-router-dom";
import { LandingHeader } from "./components/LandingHeader";
import { StaticStory } from "./components/StaticStory";
import { Film } from "./components/Film";
import { useSignedIn } from "./hooks/useSignedIn";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { isInstalledApp } from "./utils/isInstalledApp";

/**
 * Checky 소개 페이지. 서비스의 첫 화면(/)이다.
 *
 * 스크롤이 영상의 재생바처럼 움직이는 필름 한 편이다. 움직임 줄이기를 켠 방문자에게는
 * 같은 장면을 멈춘 채 세로로 이어 보여 준다.
 *
 * 로그인한 사용자와 설치한 앱은 홈으로 보낸다. 로그인 여부는 인증 모듈을 불러온 뒤에야 알 수 있어
 * 처음 오는 방문자를 기다리게 하지 않도록 필름을 먼저 그리고, 확인되는 순간 넘긴다.
 */
function LandingPage() {
  const signedIn = useSignedIn();
  const reducedMotion = usePrefersReducedMotion();

  if (signedIn || isInstalledApp()) return <Navigate to="/home" replace />;

  return (
    <main className="bg-surface text-content">
      <h1 className="sr-only">Checky — 할 일과 루틴을 나눠 체크하고, 해 온 것을 기록으로 보는 서비스</h1>
      <LandingHeader />
      {reducedMotion ? <StaticStory /> : <Film />}
    </main>
  );
}

export default LandingPage;

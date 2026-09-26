import { Link } from "react-router-dom";

/**
 * 랜딩 머리. 이미 Checky 를 아는 방문자가 이야기를 끝까지 보지 않아도 되도록
 * 시작하기를 처음부터 끝까지 한자리에 둔다. 가운데 무대에는 브랜드를 늦게 드러내므로
 * 여기에는 로고를 두지 않는다.
 *
 * 로그인 화면으로 보낸다. 가입 고지가 그 화면에 있기 때문이다.
 */
export const LandingHeader = () => (
  <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end px-4 py-3 sm:px-6 sm:py-4">
    <Link
      to="/login"
      className="pressable pointer-events-auto rounded-md bg-primary px-3 py-1 text-sm font-bold text-on-primary transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
    >
      시작하기
    </Link>
  </header>
);

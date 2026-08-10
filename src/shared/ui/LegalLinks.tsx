import { Link } from "react-router-dom";
import { Stack } from "@/shared/ui/primitives";

/**
 * @file LegalLinks.tsx
 * @description 이용약관·개인정보 처리방침으로 가는 링크.
 *
 * 로그인 화면과 마이 정보 두 곳에서 쓴다. 가입 시점에 한 번 보여주는 것으로는
 * 부족하고, 이미 가입한 이용자가 나중에 다시 찾을 경로도 있어야 한다.
 */

const linkClass = "underline underline-offset-2 hover:text-content pressable";

export const LegalLinks = () => {
  return (
    <Stack
      gap={2}
      direction="row"
      align="center"
      className="text-xs text-content-muted"
    >
      <Link to="/terms" className={linkClass}>
        이용약관
      </Link>
      <span aria-hidden="true">·</span>
      <Link to="/privacy" className={linkClass}>
        개인정보 처리방침
      </Link>
    </Stack>
  );
};

/**
 * 로그인 버튼 아래에 두는 동의 고지.
 *
 * 별도 체크박스 대신 가입 시점 고지 방식을 쓴다. 로그인 수단이 Google 하나뿐이라
 * 동의하지 않으면 가입 자체가 성립하지 않으므로, 선택지가 없는 체크박스를
 * 하나 더 두는 것은 단계만 늘린다.
 */
export const LegalConsentNotice = () => {
  return (
    <p className="text-center text-xs leading-relaxed text-content-muted">
      로그인하면{" "}
      <Link to="/terms" className={linkClass}>
        이용약관
      </Link>
      과{" "}
      <Link to="/privacy" className={linkClass}>
        개인정보 처리방침
      </Link>
      에<br className="sm:hidden" /> 동의한 것으로 봅니다.
    </p>
  );
};

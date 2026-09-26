/*
 * 로그인 화면과 랜딩의 시작하기 버튼이 함께 쓴다.
 * firebase 를 불러오지 않는 파일로 두어, 랜딩 첫 화면이 인증 SDK 를 기다리지 않게 한다.
 */

/** 로그인 실패 원인별 안내 문구를 반환합니다. */
export const getLoginErrorMessage = (error: unknown): string | null => {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    // 사용자가 스스로 창을 닫은 경우는 오류가 아니므로 알리지 않는다
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/popup-blocked":
      return "팝업이 차단되었어요. 브라우저 팝업 허용 후 다시 시도해 주세요.";
    case "auth/network-request-failed":
      return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
    case "auth/account-exists-with-different-credential":
      return "다른 방식으로 가입된 계정이에요. 기존 로그인 방식을 사용해 주세요.";
    default:
      return "로그인에 실패했어요. 다시 시도해 주세요.";
  }
};

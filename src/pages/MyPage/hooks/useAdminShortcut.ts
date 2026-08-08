import { useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 통로를 열려면 눌러야 하는 횟수. 값은 `.env` 의 `VITE_ADMIN_SHORTCUT_TAP_COUNT` 에 둔다.
 *
 * 저장소가 공개돼 있어 소스에 적어 두면 커밋 이력에 그대로 남는다.
 * 다만 Vite 는 이 값을 빌드할 때 번들에 그대로 박으므로,
 * **배포된 파일을 열어 보는 사람에게까지 감춰지지는 않는다.**
 * 저장소와 이력에서 빼는 것까지가 이 처리의 몫이다.
 *
 * 값이 없거나 이상하면 통로를 아예 닫는다. 소스에 기본값을 두면 그 숫자가 다시 이력에 남는다.
 */
const REQUIRED_TAP_COUNT = Number(
  import.meta.env.VITE_ADMIN_SHORTCUT_TAP_COUNT,
);

const isShortcutConfigured =
  Number.isInteger(REQUIRED_TAP_COUNT) && REQUIRED_TAP_COUNT > 1;

/**
 * 이어서 누른 것으로 인정하는 간격(ms).
 *
 * 간격을 두지 않으면 횟수가 영영 쌓인다. 프로필 사진을 며칠에 걸쳐 나눠 누른 사람이
 * 어느 날 갑자기 관리자 페이지로 넘어가게 된다.
 */
const TAP_WINDOW_MS = 1500;

/**
 * 관리자 페이지로 들어가는 숨은 통로.
 *
 * 화면 어디에도 관리자 링크를 두지 않으면서 관리자만 들어갈 수 있게 하려고 만들었다.
 * 정해진 요소를 짧은 간격으로 정해진 횟수만큼 누르면 `/admin` 으로 넘어간다.
 *
 * 눌러도 아무 표시가 나지 않는다. 표시가 나면 관리자가 아닌 사람도
 * 여기에 뭔가 있다는 것을 알게 된다.
 *
 * @param enabled 통로를 열어 둘지. 관리자가 아니면 `undefined` 를 돌려주어
 *   호출부에 핸들러 자체가 붙지 않는다. 권한 판단은 `/admin` 쪽에서도 다시 하므로,
 *   이 값은 통로를 숨기는 용도이지 그것만으로 접근을 막지는 않는다.
 * @returns 누를 요소에 붙일 핸들러. 열려 있지 않으면 `undefined`.
 */
export const useAdminShortcut = (enabled: boolean) => {
  const navigate = useNavigate();
  const tapCountRef = useRef(0);
  const lastTappedAtRef = useRef(0);

  if (!enabled || !isShortcutConfigured) return undefined;

  return () => {
    const now = Date.now();
    const isContinued = now - lastTappedAtRef.current <= TAP_WINDOW_MS;

    lastTappedAtRef.current = now;
    tapCountRef.current = isContinued ? tapCountRef.current + 1 : 1;

    if (tapCountRef.current < REQUIRED_TAP_COUNT) return;

    // 돌아왔을 때 한 번 더 눌러 바로 넘어가지 않도록 처음으로 되돌린다
    tapCountRef.current = 0;
    navigate("/admin");
  };
};

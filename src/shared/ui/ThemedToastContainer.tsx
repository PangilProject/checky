import { ToastContainer } from "react-toastify";
import { useTheme } from "@/shared/hooks/useTheme";

/**
 * 테마를 따라가는 토스트 컨테이너.
 *
 * react-toastify 는 기본이 밝은 상자라, 다크 화면에서는 알림만 하얗게 뜬다.
 */
export const ThemedToastContainer = () => {
  const { resolved } = useTheme();
  return <ToastContainer draggable theme={resolved} />;
};

import { useEffect } from "react";
import {
  ensureAuthSubscription,
  useAuthStore,
} from "@/shared/stores/authStore";

/**
 * 공유 인증 상태를 읽는 훅.
 *
 * 상태는 authStore 한 곳에서만 관리되므로, 여러 컴포넌트가 이 훅을 사용해도
 * 구독은 하나뿐이고 화면 전환 시 로딩이 다시 시작되지 않는다.
 */
export function useAuth() {
  useEffect(() => {
    ensureAuthSubscription();
  }, []);

  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAdminLoading = useAuthStore((state) => state.isAdminLoading);

  return { user, isAdmin, isLoading, isAdminLoading };
}

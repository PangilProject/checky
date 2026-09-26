import { useEffect, useState } from "react";

/**
 * 이미 로그인한 방문자인지.
 *
 * 인증 상태는 firebase 를 불러와야 알 수 있는데, 랜딩 첫 화면이 그 용량을 기다릴 이유는 없다.
 * 화면이 뜬 뒤 인증 모듈을 따로 불러와 확인하고, 그전까지는 로그인 전으로 본다.
 */
export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void import("@/shared/stores/authStore").then(({ ensureAuthSubscription, useAuthStore }) => {
      if (cancelled) return;
      ensureAuthSubscription();
      setSignedIn(Boolean(useAuthStore.getState().user));
      unsubscribe = useAuthStore.subscribe((state) => setSignedIn(Boolean(state.user)));
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return signedIn;
}

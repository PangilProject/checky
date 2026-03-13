import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { getIsAdminCached } from "../api/auth";

/**
 * Firebase 인증 상태를 구독하고, 사용자 정보 및 관리자 여부를 제공하는 커스텀 훅
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null); // 사용자 정보
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    // Firebase 인증 상태를 구독 (로그인 / 로그아웃 변화 감지)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. 로그아웃 상태
      if (!firebaseUser) {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // 2. 로그인 상태
      setUser(firebaseUser);
      const isAdminValue = await getIsAdminCached(firebaseUser.uid);
      setIsAdmin(isAdminValue);
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 인증 구독 해제 (메모리 누수 방지)
    return () => unsubscribe();
  }, []);

  return { user, isAdmin, isLoading };
}

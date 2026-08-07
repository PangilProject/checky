import { create } from "zustand";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import {
  clearAdminCache,
  getIsAdminCached,
} from "@/shared/api/auth/adminAccess";

/**
 * @file authStore.ts
 * @description 앱 전체가 공유하는 인증 상태.
 *
 * 컴포넌트마다 인증을 구독하면 화면이 바뀔 때마다 로딩이 처음부터 다시 시작되고,
 * 이미 끝난 확인을 반복하게 된다. 구독을 한 번만 두고 상태를 공유한다.
 */

interface AuthState {
  /** 로그인된 사용자 (미로그인 시 null) */
  user: User | null;
  /** 관리자 여부 */
  isAdmin: boolean;
  /** 인증 상태 확인 중 */
  isLoading: boolean;
  /** 관리자 여부 확인 중 (인증 확인과 분리) */
  isAdminLoading: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  isAdmin: false,
  isLoading: true,
  isAdminLoading: false,
}));

/** 인증 구독은 앱 생애 동안 하나만 유지한다 */
let isSubscribed = false;

export const ensureAuthSubscription = () => {
  if (isSubscribed) return;
  isSubscribed = true;

  onAuthStateChanged(auth, (firebaseUser) => {
    // 1. 로그아웃 상태
    if (!firebaseUser) {
      // 권한 판단 캐시를 비워 다음 로그인에 이전 계정 값이 재사용되지 않게 한다
      clearAdminCache();
      useAuthStore.setState({
        user: null,
        isAdmin: false,
        isLoading: false,
        isAdminLoading: false,
      });
      return;
    }

    // 2. 로그인 상태
    // 관리자 조회(Firestore 읽기)를 기다리지 않고 인증 로딩을 먼저 끝낸다.
    // 로그인 여부 판단에 관리자 정보는 필요하지 않으며, 기다리면 그만큼
    // 로그인 화면이나 로딩 화면이 오래 남는다.
    const { uid } = firebaseUser;
    useAuthStore.setState({
      user: firebaseUser,
      isLoading: false,
      isAdminLoading: true,
    });

    getIsAdminCached(uid)
      .then((isAdmin) => {
        // 조회 중 계정이 바뀌었다면 이전 사용자의 결과를 반영하지 않는다
        if (useAuthStore.getState().user?.uid !== uid) return;
        useAuthStore.setState({ isAdmin, isAdminLoading: false });
      })
      .catch(() => {
        if (useAuthStore.getState().user?.uid !== uid) return;
        useAuthStore.setState({ isAdmin: false, isAdminLoading: false });
      });
  });
};

import { create } from "zustand";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import {
  clearAdminCache,
  getUserAccessInfoCached,
} from "@/shared/api/auth/adminAccess";
import { ensureUserProfile, updateLastActive } from "@/shared/api/auth/user";
import { formatDateToYmd } from "@/shared/hooks/formatDate";

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

/**
 * 마지막 접속 시각을 하루에 한 번만 기록한다.
 *
 * 활성 판단 기준이 일 단위이므로 접속마다 쓸 필요가 없고,
 * 매번 쓰면 사용자 한 명이 하루에 수십 번 쓰게 되어 비용만 늘어난다.
 * 지표용 기록이라 실패해도 앱 동작에 영향을 주지 않도록 조용히 넘긴다.
 */
const touchLastActiveIfNeeded = (uid: string, lastActiveAt: Date | null) => {
  const today = formatDateToYmd(new Date());
  if (lastActiveAt && formatDateToYmd(lastActiveAt) === today) return;

  void updateLastActive(uid).catch(() => {});
};

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

    getUserAccessInfoCached(uid)
      .then(({ isAdmin, lastActiveAt, exists }) => {
        if (exists) {
          // 같은 문서를 읽으며 얻은 접속 기록으로 갱신 필요 여부를 판단한다
          touchLastActiveIfNeeded(uid, lastActiveAt);
        } else {
          // 프로필이 아직 없다. 첫 로그인 중이거나, 지난 가입이 중간에 끊긴 계정이다.
          // 이 구독은 앱을 열 때마다 실행되므로 여기서 만들면 한 번 실패해도
          // 다음 접속에 다시 시도된다. 접속 기록은 생성 시 함께 남으므로
          // 여기서 따로 쓰지 않는다 (없는 문서에 쓰면 실패한다).
          void ensureUserProfile(firebaseUser).catch(() => {});
        }

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

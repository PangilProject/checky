import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore/lite";

/**
 * 로그인 사용자의 users/{uid} 문서에서 접근 권한과 접속 기록을 읽어 온다.
 */

/** 사용자 문서에서 뽑아낸 관리자 여부와 마지막 접속 시각 */
export interface UserAccessInfo {
  isAdmin: boolean;
  lastActiveAt: Date | null;
}

// uid -> 조회 결과 메모리 캐시
const accessCache = new Map<string, UserAccessInfo>();
// uid별 진행 중 요청 Promise 캐시 (중복 요청 방지)
const accessFetchInFlight = new Map<string, Promise<UserAccessInfo>>();

/**
 * 권한 조회 캐시를 비운다.
 *
 * 캐시는 메모리에 uid 별로 남으므로, 로그아웃 시 비우지 않으면
 * 다른 계정으로 다시 로그인했을 때 이전 계정의 관리자 여부가 그대로 쓰인다.
 */
export const clearAdminCache = () => {
  accessCache.clear();
  accessFetchInFlight.clear();
};

/**
 * 사용자 문서를 한 번만 읽어 권한과 접속 기록을 함께 돌려준다.
 *
 * 두 값이 같은 문서에 있으므로 따로 읽지 않는다.
 * 결과는 uid 별로 메모리에 남기고, 같은 요청이 겹치면 진행 중인 것을 함께 쓴다.
 */
export const getUserAccessInfoCached = async (
  uid: string
): Promise<UserAccessInfo> => {
  // 1) 메모리 캐시 히트
  const cached = accessCache.get(uid);
  if (cached) return cached;

  // 2) 동일 uid 요청이 진행 중이면 기존 Promise 재사용
  const pending = accessFetchInFlight.get(uid);
  if (pending) return pending;

  // 3) Firestore 조회 후 캐시 저장
  const request = (async () => {
    const snap = await getDoc(doc(db, "users", uid));
    const data = snap.data();
    const info: UserAccessInfo = {
      isAdmin: data?.isAdmin === true,
      lastActiveAt:
        (data?.lastActiveAt as { toDate?: () => Date } | undefined)?.toDate?.() ??
        null,
    };
    accessCache.set(uid, info);
    return info;
  })();

  accessFetchInFlight.set(uid, request);
  try {
    return await request;
  } finally {
    // 완료된 in-flight 요청은 정리
    accessFetchInFlight.delete(uid);
  }
};

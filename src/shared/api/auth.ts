import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore/lite";

// 메모리 기반 관리자 여부 캐시 (uid → isAdmin)
const adminCache = new Map<string, boolean>();
// 진행 중인 요청 캐시 (중복 요청 방지용)
// 동일 uid 요청이 동시에 들어오면 하나의 Promise를 공유
const adminFetchInFlight = new Map<string, Promise<boolean>>();

/**
 * 사용자 관리자 여부를 캐싱 기반으로 조회하는 함수
 *
 * 동작 흐름:
 * 1. 캐시에 값이 있으면 즉시 반환 (빠른 응답)
 * 2. 동일 uid에 대한 요청이 진행 중이면 기존 Promise 반환 (중복 요청 방지)
 * 3. 없으면 Firestore에서 조회 후 캐시에 저장
 */

export const getIsAdminCached = async (uid: string): Promise<boolean> => {
  // 1. 캐시에 값이 존재하면 즉시 반환 (메모리 캐싱)
  if (adminCache.has(uid)) {
    return adminCache.get(uid) === true;
  }

  // 2. 동일 uid 요청이 이미 진행 중이면 해당 Promise 재사용
  const pending = adminFetchInFlight.get(uid);
  if (pending) return pending;

  // 3. Firestore에서 사용자 정보 조회
  const request = (async () => {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const isAdmin = snap.data()?.isAdmin === true;
    adminCache.set(uid, isAdmin);
    return isAdmin;
  })();

  // 진행 중인 요청 등록 (Promise deduplication)
  adminFetchInFlight.set(uid, request);
  try {
    return await request;
  } finally {
    // 요청 완료 후 in-flight 캐시 제거
    // → 이후 요청은 캐시(adminCache)에서 처리됨
    adminFetchInFlight.delete(uid);
  }
};

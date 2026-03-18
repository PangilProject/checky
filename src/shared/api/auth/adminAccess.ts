import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore/lite";

/**
 * @file adminAccess.ts
 * @description 관리자 접근 권한(isAdmin) 조회 유틸
 */

// uid -> isAdmin 메모리 캐시
const adminCache = new Map<string, boolean>();
// uid별 진행 중 요청 Promise 캐시 (중복 요청 방지)
const adminFetchInFlight = new Map<string, Promise<boolean>>();

/**
 * 사용자 관리자 여부를 캐시 기반으로 조회합니다.
 * 캐시에 없으면 Firestore users/{uid}.isAdmin 값을 조회합니다.
 */
export const getIsAdminCached = async (uid: string): Promise<boolean> => {
  // 1) 메모리 캐시 히트
  if (adminCache.has(uid)) {
    return adminCache.get(uid) === true;
  }

  // 2) 동일 uid 요청이 진행 중이면 기존 Promise 재사용
  const pending = adminFetchInFlight.get(uid);
  if (pending) return pending;

  // 3) Firestore 조회 후 캐시 저장
  const request = (async () => {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const isAdmin = snap.data()?.isAdmin === true;
    adminCache.set(uid, isAdmin);
    return isAdmin;
  })();

  adminFetchInFlight.set(uid, request);
  try {
    return await request;
  } finally {
    // 완료된 in-flight 요청은 정리
    adminFetchInFlight.delete(uid);
  }
};

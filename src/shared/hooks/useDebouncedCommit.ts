import { useCallback, useEffect, useRef } from "react";

type CommitFn = () => Promise<void> | void;

/**
 * 연속 조작의 서버 커밋을 마지막 상태 한 번으로 합친다.
 *
 * 드래그 정렬처럼 화면은 즉시 반영되고 서버 쓰기는 "결국" 되면 충분한 곳에 쓴다.
 * 같은 key 의 커밋만 합치고 다른 key 는 따로 보존한다 — 분류 A 를 정렬하다
 * 분류 B 로 넘어가도 A 의 마지막 상태가 사라지지 않는다.
 *
 * 언마운트와 pagehide 에는 대기 중인 커밋을 즉시 실행해 유실을 막는다.
 * 커밋 실패 처리는 넘긴 함수 안에서 끝내야 한다(여기서는 기다리지 않는다).
 */
export const useDebouncedCommit = (delayMs = 800) => {
  const pendingRef = useRef(
    new Map<string, { timer: ReturnType<typeof setTimeout>; commit: CommitFn }>()
  );

  const flushAll = useCallback(() => {
    pendingRef.current.forEach(({ timer, commit }) => {
      clearTimeout(timer);
      void commit();
    });
    pendingRef.current.clear();
  }, []);

  const schedule = useCallback(
    (key: string, commit: CommitFn) => {
      const existing = pendingRef.current.get(key);
      if (existing) clearTimeout(existing.timer);

      const timer = setTimeout(() => {
        pendingRef.current.delete(key);
        void commit();
      }, delayMs);

      pendingRef.current.set(key, { timer, commit });
    },
    [delayMs]
  );

  useEffect(() => {
    window.addEventListener("pagehide", flushAll);
    return () => {
      window.removeEventListener("pagehide", flushAll);
      flushAll();
    };
  }, [flushAll]);

  return { schedule, flushAll };
};

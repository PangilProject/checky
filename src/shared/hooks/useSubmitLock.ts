import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 제출 작업이 끝날 때까지 중복 실행을 막습니다.
 *
 * 저장 버튼 연타로 문서가 여러 번 생성되는 것을 방지하고,
 * 진행 중 여부(isSubmitting)를 버튼 비활성화에 사용할 수 있게 노출합니다.
 */
export const useSubmitLock = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 상태 반영 전의 연속 호출까지 막기 위해 ref로 잠금을 관리한다.
  const lockRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runExclusive = useCallback(async (task: () => Promise<void>) => {
    if (lockRef.current) return;

    lockRef.current = true;
    setIsSubmitting(true);
    try {
      await task();
    } finally {
      lockRef.current = false;
      // 제출 성공 시 모달이 닫히므로 언마운트 이후 상태 갱신을 피한다.
      if (mountedRef.current) setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, runExclusive };
};

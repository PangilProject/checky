import { useEffect, useRef, useState } from "react";

/**
 * 로딩 화면이 너무 빨리 사라져 깜빡이는 것을 막기 위한 훅.
 *
 * 실제 로딩(`isLoading`)이 끝나더라도, 로딩이 시작된 시점부터 최소 `minMs`
 * 동안은 로딩 상태를 유지한다. 로딩이 한 번도 없었던 경우(처음부터 false)는
 * 인위적인 지연을 주지 않는다.
 *
 * @param isLoading 실제 로딩 상태
 * @param minMs 최소 표시 시간(ms). 기본 1200ms
 * @returns 화면에 로딩을 보여줄지 여부
 */
export function useMinimumLoading(isLoading: boolean, minMs = 1200) {
  const [show, setShow] = useState(isLoading);
  const startRef = useRef<number | null>(isLoading ? Date.now() : null);

  useEffect(() => {
    if (isLoading) {
      if (startRef.current === null) startRef.current = Date.now();
      setShow(true);
      return;
    }

    // 로딩이 한 번도 시작되지 않았으면 바로 종료
    if (startRef.current === null) {
      setShow(false);
      return;
    }

    // 실제 로딩은 끝났지만, 최소 표시 시간을 채운다
    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(0, minMs - elapsed);
    const timer = setTimeout(() => {
      setShow(false);
      startRef.current = null;
    }, remaining);

    return () => clearTimeout(timer);
  }, [isLoading, minMs]);

  return show;
}

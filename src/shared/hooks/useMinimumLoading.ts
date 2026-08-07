import { useEffect, useState } from "react";

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
  // 최소 표시 시간이 지났는지 여부 (로딩이 없었다면 처음부터 true)
  const [minElapsed, setMinElapsed] = useState(!isLoading);

  // 렌더 중 상태 조정: 새 로딩이 시작되면 최소 표시 시간을 다시 카운트
  const [prevLoading, setPrevLoading] = useState(isLoading);
  if (isLoading !== prevLoading) {
    setPrevLoading(isLoading);
    if (isLoading) setMinElapsed(false);
  }

  useEffect(() => {
    if (minElapsed) return;
    const timer = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(timer);
  }, [minElapsed, minMs]);

  return isLoading || !minElapsed;
}

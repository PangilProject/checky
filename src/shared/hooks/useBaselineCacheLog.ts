import { useEffect, useRef } from "react";
import { baselineCacheCheck } from "@/shared/utils/perfBaseline";

/**
 * 쿼리가 캐시로 채워졌는지 한 번씩만 기록한다 (개발 빌드 전용 성능 관찰).
 *
 * 같은 날짜·같은 상태에서는 다시 찍지 않는다. 그러지 않으면 렌더마다 줄이 쌓여
 * 정작 보고 싶은 "날짜를 옮겼을 때 서버를 읽었는가"가 묻힌다.
 *
 * @param label 로그에 남길 쿼리 이름 (예: "tasks/byDate")
 * @param scope 이 로그를 구분하는 값. 이 값이 바뀌면 다시 한 번 찍는다
 */
export const useBaselineCacheLog = (
  label: string,
  scope: string,
  state: { status?: string; dataUpdatedAt?: number } | undefined,
  enabled: boolean,
) => {
  const lastRef = useRef<{ scope: string; status?: string }>({
    scope: "",
    status: undefined,
  });

  const status = state?.status;
  const dataUpdatedAt = state?.dataUpdatedAt;

  useEffect(() => {
    if (!enabled) return;

    const last = lastRef.current;
    const shouldLog =
      status === "success" && (last.scope !== scope || last.status !== status);
    if (!shouldLog) return;

    lastRef.current = { scope, status };
    baselineCacheCheck(label, { date: scope, status, updatedAt: dataUpdatedAt });
  }, [dataUpdatedAt, enabled, label, scope, status]);
};

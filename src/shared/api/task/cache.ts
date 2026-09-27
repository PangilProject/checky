import type { QueryClient } from "@tanstack/react-query";
import { taskKeys, taskLogKeys } from "@/shared/api/keys";

/**
 * 할 일이 바뀐 달의 달 단위 캐시를 낡음으로 표시한다.
 *
 * 할 일을 바꾸는 경로(추가·체크·수정·삭제·이동·일괄 동작)는 날짜별 캐시만 고친다.
 * 기록 화면은 달 단위 캐시를 읽으므로, 여기서 표시해 두어야 다음에 열 때 그 달만 다시 읽는다.
 * 무효화는 화면이 열려 있지 않으면 표시만 하므로 read 가 늘지 않는다 (비용 이슈 16).
 *
 * logs 를 켜면 완료 기록 캐시도 함께 표시한다. 체크·삭제·이동처럼 기록이 바뀐 경우에 켠다.
 */
export const markTaskMonthsStale = ({
  queryClient,
  userId,
  dates,
  tasks = true,
  logs = false,
}: {
  queryClient: QueryClient;
  userId: string;
  dates: string[];
  tasks?: boolean;
  logs?: boolean;
}) => {
  const months = Array.from(
    new Set(dates.filter(Boolean).map((date) => date.slice(0, 7))),
  );

  return Promise.all(
    months.flatMap((month) => [
      ...(tasks
        ? [queryClient.invalidateQueries({ queryKey: taskKeys.byMonth(userId, month) })]
        : []),
      ...(logs
        ? [queryClient.invalidateQueries({ queryKey: taskLogKeys.byMonth(userId, month) })]
        : []),
    ]),
  );
};

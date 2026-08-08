import { useQuery } from "@tanstack/react-query";
import { getNoticesOnce } from "@/shared/api/notice";
import { noticeKeys } from "@/shared/api/keys";

export type { Notice } from "@/shared/api/notice";

/**
 * 공지 목록을 읽는다.
 *
 * 관리자 화면과 같은 키를 쓰므로, 관리자가 공지를 고치면 이쪽도 함께 갱신된다.
 * 공지는 자주 바뀌지 않아 staleTime 을 길게 두고 모달을 열 때마다 다시 읽지 않는다.
 */
export const useNotices = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: noticeKeys.all,
    queryFn: getNoticesOnce,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });

  return { notices: data ?? [], loading: isLoading, isError };
};

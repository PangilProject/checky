import { useQuery } from "@tanstack/react-query";
import { getNoticesOnce } from "@/shared/api/notice";
import { noticeKeys } from "@/shared/api/keys";

export type { Notice } from "@/shared/api/notice";

/**
 * 공지 목록을 읽는다.
 *
 * 관리자 화면과 같은 키를 쓰므로, 관리자가 공지를 고치면 이쪽도 함께 갱신된다.
 * 공지는 자주 바뀌지 않아 전역 기본 캐시 정책(10분)을 그대로 쓴다.
 */
export const useNotices = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: noticeKeys.all,
    queryFn: getNoticesOnce,
  });

  return { notices: data ?? [], loading: isLoading, isError };
};

import { useQuery } from "@tanstack/react-query";
import { getNoticesOnce } from "@/shared/api/notice";
import { noticeKeys } from "@/shared/api/keys";

export type { Notice as AdminNotice } from "@/shared/api/notice";

/**
 * 관리자 화면의 공지 목록을 읽는다.
 *
 * 사용자 화면과 같은 키·같은 조회를 쓴다. 저장하거나 지운 뒤 목록을 다시 읽는 일은
 * noticeKeys.all 무효화로 처리하므로 여기에 갱신 함수를 두지 않는다.
 * 관리자는 방금 바꾼 결과를 봐야 하므로 캐시를 오래 두지 않는다.
 */
export const useAdminNotices = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: noticeKeys.all,
    queryFn: getNoticesOnce,
    staleTime: 0,
  });

  return { notices: data ?? [], loading: isLoading, isError };
};

/**
 * 공지 날짜 표시 형식.
 *
 * 목록과 상세가 같은 형식을 쓰도록 한곳에 둔다.
 */
export const formatNoticeDate = (date?: Date) => {
  if (!date) return "-";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

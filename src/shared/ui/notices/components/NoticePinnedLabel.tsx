/**
 * 고정 공지 표시 레이블.
 *
 * 색이나 아이콘만으로 표시하면 색을 구분하기 어려운 사용자에게 전달되지 않고,
 * 제목 문자열에 이모지를 넣으면 제목이 잘릴 때 함께 잘린다.
 *
 * 채운 배지 대신 작은 글자로 두는 이유는, 목록에서 제목이 주인공이어야 하기 때문이다.
 * 고정 공지는 이미 맨 위에 정렬되므로 레이블은 "왜 위에 있는지"만 설명하면 된다.
 */
export const NoticePinnedLabel = () => {
  return (
    <span className="shrink-0 text-xs font-bold text-content-muted">고정</span>
  );
};

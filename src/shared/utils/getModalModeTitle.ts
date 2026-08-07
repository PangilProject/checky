/** 생성/조회/수정 모드를 가지는 모달의 공통 모드 타입 */
export type ModalMode = "CREATE" | "VIEW" | "EDIT";

/**
 * 모드에 따른 모달 제목을 만든다.
 *
 * 카테고리·루틴·태스크·공지 모달이 같은 규칙을 각자 구현하고 있어 한곳으로 모았다.
 */
export const getModalModeTitle = (mode: ModalMode, noun: string) => {
  if (mode === "CREATE") return `${noun} 추가`;
  if (mode === "EDIT") return `${noun} 수정`;
  return `${noun} 상세`;
};

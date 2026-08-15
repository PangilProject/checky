import { useEffect, useRef } from "react";

/**
 * 편집을 시작하는 순간 입력창에 커서를 넣는다.
 *
 * 상세에서 "수정"을 누르면 포커스가 방금 누른 버튼에 남아, 타이핑을 하려면
 * 입력창을 한 번 더 눌러야 한다. 작성 화면을 열었을 때도 마찬가지다.
 *
 * 커서는 글자 끝에 둔다. 전체 선택으로 두면 한 글자만 잘못 눌러도 기존 내용이
 * 통째로 사라지는데, 이름 뒤에 몇 글자 덧붙이는 쪽이 훨씬 흔한 편집이다.
 *
 * @param isActive 편집이 가능한 상태인가. false → true 로 바뀔 때 포커스를 준다.
 */
export const useAutoFocus = <
  T extends HTMLInputElement | HTMLTextAreaElement,
>(
  isActive: boolean,
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isActive) return;

    const element = ref.current;
    if (!element) return;

    element.focus();
    const end = element.value.length;
    element.setSelectionRange(end, end);
  }, [isActive]);

  return ref;
};

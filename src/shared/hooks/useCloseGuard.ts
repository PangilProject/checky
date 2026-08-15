import { useCallback, useState } from "react";

/**
 * 고치던 내용이 남아 있으면 닫기 전에 한 번 묻는다.
 *
 * 모달이 닫히는 길은 세 갈래다 — 닫기·취소 버튼, ESC, 배경 클릭.
 * 뒤의 둘은 ModalWrapper 가 넘겨받은 onClose 를 그대로 부르므로, 버튼에만
 * 확인을 붙이면 나머지 두 길로 입력이 소리 없이 사라진다.
 * 그래서 ModalWrapper 에 넘기는 onClose 자체를 requestClose 로 바꿔
 * 세 갈래가 모두 이 한 지점을 지나가게 한다.
 */

interface UseCloseGuardParams {
  isDirty: boolean;
  onClose: () => void;
}

export const useCloseGuard = ({ isDirty, onClose }: UseCloseGuardParams) => {
  const [isGuardOpen, setIsGuardOpen] = useState(false);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setIsGuardOpen(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  /** 확인 모달에서 "닫기" — 고치던 내용을 버리고 닫는다 */
  const confirmClose = useCallback(() => {
    setIsGuardOpen(false);
    onClose();
  }, [onClose]);

  /** 확인 모달에서 "취소" — 편집으로 돌아간다 */
  const cancelClose = useCallback(() => setIsGuardOpen(false), []);

  return { isGuardOpen, requestClose, confirmClose, cancelClose };
};

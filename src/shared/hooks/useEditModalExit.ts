import { useCallback } from "react";
import { useCloseGuard } from "./useCloseGuard";

/**
 * 상세 → 수정 구조를 가진 모달에서 "고치던 것을 그만두기"를 다룬다.
 *
 * 이런 모달은 나가는 곳이 두 군데다. 상세로 열어 수정에 들어간 것이라면 돌아갈
 * 곳은 상세 화면이고, 처음부터 작성·수정으로 열렸다면 모달을 닫는 것뿐이다.
 * 이 구분을 모달마다 따로 쓰면 어떤 모달은 상세로 돌아가고 어떤 모달은 통째로
 * 닫히는 식으로 갈린다.
 */

interface UseEditModalExitParams {
  /** 상세로 열린 모달에서 수정 중인가 */
  isEditingFromDetail: boolean;
  isDirty: boolean;
  /** 고치던 값을 되돌리고 상세 화면으로 돌아간다 */
  onRevertToDetail: () => void;
  /** 모달을 닫는다 */
  onClose: () => void;
}

export const useEditModalExit = ({
  isEditingFromDetail,
  isDirty,
  onRevertToDetail,
  onClose,
}: UseEditModalExitParams) => {
  /** 고치던 내용을 버리고 나간다. 나가는 곳은 상황에 따라 상세 또는 모달 밖. */
  const discard = useCallback(() => {
    if (isEditingFromDetail) {
      onRevertToDetail();
      return;
    }
    onClose();
  }, [isEditingFromDetail, onClose, onRevertToDetail]);

  const guard = useCloseGuard({ isDirty, onClose: discard });

  /**
   * 수정 화면의 "취소".
   *
   * 상세로 돌아가는 경우에는 되묻지 않는다. 원래 값이 그대로 눈앞에 남고,
   * 사용자가 방금 이름을 보고 누른 되돌리기이기 때문이다. 확인이 필요한 쪽은
   * 화면이 사라져 되돌릴 실마리가 없어지는 경우 — 즉 모달이 닫히는 경우다.
   */
  const cancelEdit = useCallback(() => {
    if (isEditingFromDetail) {
      discard();
      return;
    }
    guard.requestClose();
  }, [discard, guard, isEditingFromDetail]);

  return { ...guard, cancelEdit };
};

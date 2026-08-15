import { ConfirmModal } from "@/shared/ui/ConfirmModal";

interface UnsavedChangesConfirmProps {
  /** 고치던 내용을 버리고 닫는다 */
  onConfirm: () => void;
  /** 편집으로 돌아간다 */
  onClose: () => void;
}

/**
 * 저장하지 않은 내용을 두고 닫으려 할 때 묻는 확인 모달.
 *
 * ConfirmModal 을 그대로 쓰되 문구를 여기 한 곳에 둔다. 같은 상황을 모달마다
 * 다른 말로 물으면 사용자에게는 서로 다른 일처럼 보인다.
 * 입력이 사라지는 것은 되돌릴 수 없으므로 danger 로 표시한다.
 */
export const UnsavedChangesConfirm = ({
  onConfirm,
  onClose,
}: UnsavedChangesConfirmProps) => {
  return (
    <ConfirmModal
      title="수정 중인 내용이 있습니다"
      // 나가는 곳이 모달마다 다르다. 할 일 모달은 상세 화면으로 돌아가고 나머지는
      // 모달이 닫히므로, "닫는다"고 단정하지 않고 사라지는 것만 알린다.
      description="변경한 내용이 사라집니다."
      confirmText="닫기"
      danger
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};

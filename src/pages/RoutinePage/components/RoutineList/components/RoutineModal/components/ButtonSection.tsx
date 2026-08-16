import { Button } from "@/shared/ui/primitives";
import type { ModalMode } from "@/shared/utils/getModalModeTitle";

interface ButtonSectionProps {
  mode: ModalMode;
  isSubmitting?: boolean;
  /** VIEW 의 "닫기" — 모달을 닫는다 */
  onClose: () => void;
  /** CREATE·EDIT 의 "취소" — 수정 중이면 상세로 돌아가고, 작성 중이면 닫는다 */
  onCancel?: () => void;
  onEdit?: () => void;
  /** 저장할 것이 있는가. 고친 데가 없으면 저장 버튼을 막는다 */
  canSubmit?: boolean;
  onSubmit?: () => void;
  onDelete?: () => void;
}

export const ButtonSection = ({
  mode,
  isSubmitting = false,
  onClose,
  onCancel,
  onEdit,
  canSubmit = true,
  onSubmit,
  onDelete,
}: ButtonSectionProps) => {
  if (mode === "VIEW") {
    return (
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          닫기
        </Button>
        <Button
          variant="outline"
          tone="danger"
          onClick={onDelete}
          disabled={isSubmitting}
        >
          삭제
        </Button>
        <Button onClick={onEdit} disabled={isSubmitting}>
          수정
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onCancel ?? onClose}
        disabled={isSubmitting}
      >
        취소
      </Button>
      <Button onClick={onSubmit} disabled={isSubmitting || !canSubmit}>
        {isSubmitting ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
};

import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import type { RoutineModalMode } from "../types";

interface ButtonSectionProps {
  mode: RoutineModalMode;
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  /** 변경 사항이 없거나 제출 진행 중이면 저장 버튼을 비활성화한다. */
  submitDisabled?: boolean;
}

export const ButtonSection = ({
  mode,
  onClose,
  onEdit,
  onSubmit,
  onDelete,
  submitDisabled = false,
}: ButtonSectionProps) => {
  if (mode === "VIEW") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
        <NormalRedUnFillButton text="삭제" onClick={onDelete} />
        <NormalBlackButton text="수정" onClick={onEdit} />
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton text="취소" onClick={onClose} />
      <NormalBlackButton
        text="저장"
        onClick={onSubmit}
        disabled={submitDisabled}
      />
    </div>
  );
};

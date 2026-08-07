import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import type { RoutineModalMode } from "../types";

interface ButtonSectionProps {
  mode: RoutineModalMode;
  isSubmitting?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
}

export const ButtonSection = ({
  mode,
  isSubmitting = false,
  onClose,
  onEdit,
  onSubmit,
  onDelete,
}: ButtonSectionProps) => {
  if (mode === "VIEW") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton
          text="닫기"
          onClick={onClose}
          disabled={isSubmitting}
        />
        <NormalRedUnFillButton
          text="삭제"
          onClick={onDelete}
          disabled={isSubmitting}
        />
        <NormalBlackButton
          text="수정"
          onClick={onEdit}
          disabled={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton
        text="취소"
        onClick={onClose}
        disabled={isSubmitting}
      />
      <NormalBlackButton
        text={isSubmitting ? "저장 중..." : "저장"}
        onClick={onSubmit}
        disabled={isSubmitting}
      />
    </div>
  );
};

import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalBlueUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";

interface ButtonSectionProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  isSubmitting?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onMove?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
}

export const ButtonSection = ({
  mode,
  isSubmitting = false,
  onClose,
  onEdit,
  onMove,
  onSubmit,
  onDelete,
}: ButtonSectionProps) => {
  if (mode === "VIEW") {
    return (
      <div className="flex flex-wrap justify-between gap-2">
        <NormalBlackUnFillButton
          text="닫기"
          onClick={onClose}
          disabled={isSubmitting}
        />
        <NormalBlueUnFillButton
          text="이동"
          onClick={onMove}
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

  if (mode === "EDIT") {
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
  }

  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton
        text="닫기"
        onClick={onClose}
        disabled={isSubmitting}
      />
      <NormalBlackButton
        text={isSubmitting ? "저장 중..." : "완료"}
        onClick={onSubmit}
        disabled={isSubmitting}
      />
    </div>
  );
};

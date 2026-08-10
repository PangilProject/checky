import { Button } from "@/shared/ui/primitives";

interface ButtonSectionProps {
  mode: "VIEW" | "EDIT";
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
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          닫기
        </Button>
        <Button
          variant="outline"
          tone="accent"
          onClick={onMove}
          disabled={isSubmitting}
        >
          이동
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
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        취소
      </Button>
      <Button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
};

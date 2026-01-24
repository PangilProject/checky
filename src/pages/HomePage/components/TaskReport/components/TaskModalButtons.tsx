import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";

interface ButtonSectionProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
}

export const ButtonSection = ({
  mode,
  onClose,
  onEdit,
  onSubmit,
  onDelete,
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

  if (mode === "EDIT") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="취소" onClick={onClose} />
        <NormalBlackButton text="저장" onClick={onSubmit} />
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton text="닫기" onClick={onClose} />
      <NormalBlackButton text="완료" onClick={onSubmit} />
    </div>
  );
};

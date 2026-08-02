import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalBlueUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";

interface ButtonSectionProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  onClose: () => void;
  onEdit?: () => void;
  onMove?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  /** 변경 사항이 없거나 제출 진행 중이면 저장/완료 버튼을 비활성화한다. */
  submitDisabled?: boolean;
}

export const ButtonSection = ({
  mode,
  onClose,
  onEdit,
  onMove,
  onSubmit,
  onDelete,
  submitDisabled = false,
}: ButtonSectionProps) => {
  if (mode === "VIEW") {
    return (
      <div className="flex flex-wrap justify-between gap-2">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
        <NormalBlueUnFillButton text="이동" onClick={onMove} />
        <NormalRedUnFillButton text="삭제" onClick={onDelete} />
        <NormalBlackButton text="수정" onClick={onEdit} />
      </div>
    );
  }

  if (mode === "EDIT") {
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
  }

  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton text="닫기" onClick={onClose} />
      <NormalBlackButton
        text="완료"
        onClick={onSubmit}
        disabled={submitDisabled}
      />
    </div>
  );
};

import { ModalWrapper } from "@/shared/ui/Modal";
import { Text3, Text5 } from "@/shared/ui/Text";
import { NormalBlackButton, NormalBlackUnFillButton } from "@/shared/ui/Button";
import { Space10 } from "@/shared/ui/Space";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmText = "확인",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <ModalWrapper onClose={onClose}>
      <Text5 text={title} className="font-bold" />
      {description && (
        <>
          <Space10 direction="mb" />
          <Text3 text={description} className="opacity-70" />
        </>
      )}

      <Space10 direction="mb" />

      <div className="flex justify-end gap-2">
        <NormalBlackUnFillButton text="취소" onClick={onClose} />
        {danger ? (
          <NormalBlackButton
            text={confirmText}
            className="bg-red-500 text-white"
            onClick={onConfirm}
          />
        ) : (
          <NormalBlackButton text={confirmText} onClick={onConfirm} />
        )}
      </div>
    </ModalWrapper>
  );
}

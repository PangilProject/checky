import { useState } from "react";
import { ModalWrapper } from "@/shared/ui/Modal";
import { Text3, Text5 } from "@/shared/ui/Text";
import { NormalBlackButton, NormalBlackUnFillButton } from "@/shared/ui/Button";
import { Space10 } from "@/shared/ui/Space";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
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
  // 확인 처리 중 중복 클릭 방지
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ModalWrapper onClose={isConfirming ? () => {} : onClose}>
      <Text5 text={title} className="font-bold" />
      {description && (
        <>
          <Space10 direction="mb" />
          <Text3 text={description} className="opacity-70" />
        </>
      )}

      <Space10 direction="mb" />

      <div className="flex justify-end gap-2">
        <NormalBlackUnFillButton
          text="취소"
          onClick={onClose}
          disabled={isConfirming}
        />
        <NormalBlackButton
          text={isConfirming ? "처리 중..." : confirmText}
          className={danger ? "bg-red-500 text-white" : undefined}
          onClick={() => void handleConfirm()}
          disabled={isConfirming}
        />
      </div>
    </ModalWrapper>
  );
}

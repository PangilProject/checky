import { useState } from "react";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { Text3 } from "@/shared/ui/Text";
import { NormalBlackButton, NormalBlackUnFillButton } from "@/shared/ui/Button";
import { Space4 } from "@/shared/ui/Space";

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
      <ModalTitle text={title} />
      {/*
        설명은 있을 때만 렌더하되, 제목 아래 여백은 ModalTitle 이 항상 담당한다.
        기존에는 여백이 description 조건 안에 있어 설명이 없으면 간격이 사라졌다.
      */}
      {description && (
        <>
          <Text3 text={description} className="opacity-70" />
          <Space4 direction="mb" />
        </>
      )}

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

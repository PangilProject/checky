import { useState } from "react";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { Button, Stack, Text } from "@/shared/ui/primitives";
import { cn } from "@/shared/ui/cn";

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
        <Text tone="muted" className="mb-4">
          {description}
        </Text>
      )}

      <Stack gap={2} direction="row" justify="end">
        <Button variant="outline" onClick={onClose} disabled={isConfirming}>
          취소
        </Button>
        <Button
          tone={danger ? "danger" : "neutral"}
          onClick={() => void handleConfirm()}
          disabled={isConfirming}
        >
          {/*
            두 문구를 같은 칸에 겹쳐 두고 하나만 보이게 해, 버튼 폭을 긴 쪽에 고정한다.
            문구가 바뀌며 폭이 달라지면 옆 버튼이 밀리고, 비활성 전환 애니메이션과 겹쳐
            밀리기 전 버튼 조각이 화면에 잔상으로 남는다.
          */}
          <span className="grid">
            <span className={cn("col-start-1 row-start-1", isConfirming && "invisible")}>
              {confirmText}
            </span>
            <span className={cn("col-start-1 row-start-1", !isConfirming && "invisible")}>
              처리 중...
            </span>
          </span>
        </Button>
      </Stack>
    </ModalWrapper>
  );
}

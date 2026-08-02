import { ModalWrapper } from "@/shared/ui/Modal";
import { Text3, Text5 } from "@/shared/ui/Text";
import { NormalBlackButton, NormalBlackUnFillButton } from "@/shared/ui/Button";
import { Space10 } from "@/shared/ui/Space";
import { useSubmitLock } from "@/shared/hooks/useSubmitLock";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  /** Promise를 반환하면 완료될 때까지 확인/취소/배경 클릭이 잠긴다. */
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
  const { isSubmitting, runExclusive } = useSubmitLock();

  const handleConfirm = () =>
    runExclusive(async () => {
      await onConfirm();
    });

  return (
    // 처리 중 배경 클릭으로 닫으면 작업은 계속 도는데 취소된 것으로 오해할 수 있다.
    <ModalWrapper onClose={isSubmitting ? () => {} : onClose}>
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
          disabled={isSubmitting}
        />
        {danger ? (
          <NormalBlackButton
            text={confirmText}
            className="bg-red-500 text-white"
            onClick={handleConfirm}
            disabled={isSubmitting}
          />
        ) : (
          <NormalBlackButton
            text={confirmText}
            onClick={handleConfirm}
            disabled={isSubmitting}
          />
        )}
      </div>
    </ModalWrapper>
  );
}

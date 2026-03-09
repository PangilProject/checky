import { ModalWrapper } from "@/shared/ui/Modal";
import { Text5 } from "@/shared/ui/Text";
import { NormalBlackButton, NormalBlackUnFillButton } from "@/shared/ui/Button";
import { Space10 } from "@/shared/ui/Space";
import { useState } from "react";

interface DateSelectModalProps {
  action: string;
  initialDate: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

export function DateSelectModal({
  action,
  initialDate,
  onConfirm,
  onClose,
}: DateSelectModalProps) {
  const [value, setValue] = useState(initialDate.toISOString().slice(0, 10));

  return (
    <ModalWrapper onClose={onClose}>
      <Text5 text="날짜 선택" className="font-bold" />
      <Space10 direction="mb" />

      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border-b outline-none"
      />

      <Space10 direction="mb" />

      <div className="flex justify-end gap-2">
        <NormalBlackUnFillButton text="취소" onClick={onClose} />
        <NormalBlackButton
          text={action === "after" ? "이동" : "복사"}
          onClick={() => {
            onConfirm(new Date(value));
            onClose();
          }}
        />
      </div>
    </ModalWrapper>
  );
}

import { ModalWrapper } from "@/shared/ui/Modal";
import { Text5 } from "@/shared/ui/Text";
import { NormalBlackButton, NormalBlackUnFillButton } from "@/shared/ui/Button";
import { Space10 } from "@/shared/ui/Space";
import { useState } from "react";
import { DatePicker } from "@/shared/ui/DatePicker";
import { formatDateToYmd, parseYmd } from "@/shared/hooks/formatDate";

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
  const [value, setValue] = useState(() => formatDateToYmd(initialDate));

  return (
    <ModalWrapper onClose={onClose}>
      <Text5 text="날짜 선택" className="font-bold" />
      <Space10 direction="mb" />

      <DatePicker value={value} onChange={setValue} />

      <Space10 direction="mb" />

      <div className="flex justify-end gap-2">
        <NormalBlackUnFillButton text="취소" onClick={onClose} />
        <NormalBlackButton
          text={action === "after" ? "이동" : "복사"}
          onClick={() => {
            const selected = parseYmd(value);
            if (!selected) return;
            onConfirm(selected);
            onClose();
          }}
        />
      </div>
    </ModalWrapper>
  );
}

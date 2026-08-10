import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";

import { Button } from "@/shared/ui/primitives";
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
      <ModalTitle text="날짜 선택" />

      <DatePicker value={value} onChange={setValue} />

      <Space10 direction="mb" />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button
          onClick={() => {
            const selected = parseYmd(value);
            if (!selected) return;
            onConfirm(selected);
            onClose();
          }}
        >
          {action === "after" ? "이동" : "복사"}
        </Button>
      </div>
    </ModalWrapper>
  );
}

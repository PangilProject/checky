import { Text } from "@/shared/ui/primitives";
import { Space2 } from "@/shared/ui/Space";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { DatePicker } from "@/shared/ui/DatePicker";

interface EndDateFieldProps {
  isReadOnly: boolean;
  endDateEnabled: boolean;
  endDate: string;
  startDate: string;
  routineEndDate?: string;
  toggleEndDateEnabled: () => void;
  setEndDate: (date: string) => void;
}

export const EndDateField = ({
  isReadOnly,
  endDateEnabled,
  endDate,
  startDate,
  routineEndDate,
  toggleEndDateEnabled,
  setEndDate,
}: EndDateFieldProps) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Text variant="body" className="font-bold">
          종료 날짜
        </Text>
        {!isReadOnly && (
          <button
            className="flex items-center gap-1"
            onClick={toggleEndDateEnabled}
          >
            <Text variant="bodySm">{endDateEnabled ? "삭제" : "추가"}</Text>
            {endDateEnabled ? (
              <MdCheckBox size={15} />
            ) : (
              <MdCheckBoxOutlineBlank size={15} />
            )}
          </button>
        )}
      </div>
      <Space2 direction="mb" />
      {isReadOnly ? (
        <Text variant="bodySm" className="text-content">
          {routineEndDate ? routineEndDate : "없음"}
        </Text>
      ) : endDateEnabled ? (
        <DatePicker value={endDate} min={startDate} onChange={setEndDate} />
      ) : (
        <Text variant="bodySm" tone="muted">
          없음
        </Text>
      )}
    </div>
  );
};

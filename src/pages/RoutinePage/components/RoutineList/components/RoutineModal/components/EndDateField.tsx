import { Text2, Text3 } from "@/shared/ui/Text";
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
        <Text3 text="종료 날짜" className="font-bold" />
        {!isReadOnly && (
          <button
            className="flex items-center gap-1"
            onClick={toggleEndDateEnabled}
          >
            <Text2 text={endDateEnabled ? "삭제" : "추가"} />
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
        <Text2
          text={routineEndDate ? routineEndDate : "없음"}
          className="text-gray-700"
        />
      ) : endDateEnabled ? (
        <DatePicker value={endDate} min={startDate} onChange={setEndDate} />
      ) : (
        <Text2 text="없음" className="text-gray-500" />
      )}
    </div>
  );
};

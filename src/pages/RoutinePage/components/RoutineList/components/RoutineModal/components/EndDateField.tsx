import { Text2, Text3 } from "@/shared/ui/Text";
import { Space2 } from "@/shared/ui/Space";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";

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
              <IoIosCheckbox size={15} />
            ) : (
              <IoIosCheckboxOutline size={15} />
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
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      ) : (
        <Text2 text="없음" className="text-gray-500" />
      )}
    </div>
  );
};

import { Text2, Text3 } from "@/shared/ui/Text";
import { Space2 } from "@/shared/ui/Space";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";
import { DAYS } from "@/shared/constants/dateLabels";

interface RepeatDaysFieldProps {
  isReadOnly: boolean;
  selectAllDays: boolean;
  selectedDays: number[];
  toggleSelectAllDays: () => void;
  toggleDay: (day: number) => void;
}

export const RepeatDaysField = ({
  isReadOnly,
  selectAllDays,
  selectedDays,
  toggleSelectAllDays,
  toggleDay,
}: RepeatDaysFieldProps) => {
  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between">
        <Text3 text="반복" className="font-bold" />
        {!isReadOnly && (
          <button
            className="flex items-center gap-1"
            onClick={toggleSelectAllDays}
          >
            <Text2 text="전체" />
            {selectAllDays ? (
              <IoIosCheckbox size={15} />
            ) : (
              <IoIosCheckboxOutline size={15} />
            )}
          </button>
        )}
      </div>
      <Space2 direction="mb" />
      <div className="flex gap-3 justify-between">
        {DAYS.map((day) => {
          const active = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              disabled={isReadOnly}
              onClick={() => toggleDay(day.value)}
              className={`
                w-8 h-8 rounded-full text-sm
                border pressable
                ${
                  active
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-500"
                }
              `}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import { Stack, Text } from "@/shared/ui/primitives";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
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
        <Text variant="body" className="mb-2 font-bold">
          반복
        </Text>
        {!isReadOnly && (
          <button
            className="flex items-center gap-1"
            onClick={toggleSelectAllDays}
          >
            <Text variant="bodySm">전체</Text>
            {selectAllDays ? (
              <MdCheckBox size={15} />
            ) : (
              <MdCheckBoxOutlineBlank size={15} />
            )}
          </button>
        )}
      </div>
      <Stack gap={3} direction="row" justify="between">
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
                    ? "bg-primary text-on-primary border-line-strong"
                    : "border-content-subtle text-content-muted"
                }
              `}
            >
              {day.label}
            </button>
          );
        })}
      </Stack>
    </div>
  );
};

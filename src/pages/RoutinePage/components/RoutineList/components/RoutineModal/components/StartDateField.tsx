import { Text } from "@/shared/ui/primitives";
import { Space2 } from "@/shared/ui/Space";
import { DatePicker } from "@/shared/ui/DatePicker";
import type { Routine } from "@/shared/api/routine";
import type { RoutineModalMode } from "../types";

interface StartDateFieldProps {
  mode: RoutineModalMode;
  routine?: Routine;
  startDate: string;
  setStartDate: (date: string) => void;
  isReadOnly: boolean;
  isRepeatChanged: boolean;
  effectiveFrom: string;
  setEffectiveFrom: (date: string) => void;
  endDateEnabled: boolean;
  endDate: string;
  setEndDate: (date: string) => void;
}

export const StartDateField = ({
  mode,
  routine,
  startDate,
  setStartDate,
  isReadOnly,
  isRepeatChanged,
  effectiveFrom,
  setEffectiveFrom,
  endDateEnabled,
  endDate,
  setEndDate,
}: StartDateFieldProps) => {
  return (
    <div>
      <Text variant="body" className="font-bold">
        {mode === "CREATE"
          ? "시작 날짜"
          : isRepeatChanged
            ? "변경 적용 날짜"
            : "시작 날짜"}
      </Text>
      <Space2 direction="mb" />
      {isReadOnly ? (
        <Text variant="bodySm" className="text-content">
          {startDate}
        </Text>
      ) : mode === "EDIT" && !isRepeatChanged ? (
        <Text variant="bodySm" className="text-content">
          {routine?.startDate ?? startDate}
        </Text>
      ) : mode === "EDIT" && isRepeatChanged ? (
        <DatePicker
          value={effectiveFrom}
          min={routine?.startDate}
          onChange={setEffectiveFrom}
        />
      ) : (
        <DatePicker
          value={startDate}
          onChange={(next) => {
            setStartDate(next);
            if (endDateEnabled && endDate && endDate < next) {
              setEndDate(next);
            }
          }}
        />
      )}
    </div>
  );
};

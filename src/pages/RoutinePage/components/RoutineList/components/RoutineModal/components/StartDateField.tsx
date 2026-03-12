import { Text2, Text3 } from "@/shared/ui/Text";
import { Space2 } from "@/shared/ui/Space";
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
      <Text3
        text={
          mode === "CREATE"
            ? "시작 날짜"
            : isRepeatChanged
              ? "변경 적용 날짜"
              : "시작 날짜"
        }
        className="font-bold"
      />
      <Space2 direction="mb" />
      {isReadOnly ? (
        <Text2 text={startDate} className="text-gray-700" />
      ) : mode === "EDIT" && !isRepeatChanged ? (
        <Text2
          text={routine?.startDate ?? startDate}
          className="text-gray-700"
        />
      ) : mode === "EDIT" && isRepeatChanged ? (
        <input
          type="date"
          value={effectiveFrom}
          min={routine?.startDate}
          onChange={(e) => setEffectiveFrom(e.target.value)}
        />
      ) : (
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            const next = e.target.value;
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

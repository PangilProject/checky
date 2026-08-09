import { useMemo, useState } from "react";
import type { Routine } from "@/shared/api/routine";
import type { RoutineModalMode } from "../types";
import { getTodayYmd } from "@/shared/hooks/formatDate";
import { hasSameDays } from "../utils";
import { DAYS } from "@/shared/constants/dateLabels";

export const useRoutineModalState = ({
  mode,
  routine,
}: {
  mode: RoutineModalMode;
  routine?: Routine;
}) => {
  const [title, setTitle] = useState(routine?.title ?? "");
  const [selectedDays, setSelectedDays] = useState<number[]>(
    routine?.days ?? [],
  );
  const [currentMode, setCurrentMode] = useState<RoutineModalMode>(mode);

  // toISOString()은 UTC 기준이라 KST 오전 9시 이전에는 어제 날짜가 되므로
  // 로컬 날짜 헬퍼를 사용한다
  const [startDate, setStartDate] = useState(
    routine?.startDate ?? getTodayYmd(),
  );
  const [effectiveFrom, setEffectiveFrom] = useState(getTodayYmd());
  const [endDateEnabled, setEndDateEnabled] = useState(
    Boolean(routine?.endDate),
  );
  const [endDate, setEndDate] = useState(routine?.endDate ?? "");

  const isReadOnly = currentMode === "VIEW";
  const isEditMode = currentMode === "EDIT";
  const isRepeatChanged = routine
    ? !hasSameDays(selectedDays, routine.days)
    : false;

  const selectAllDays = useMemo(
    () => selectedDays.length === DAYS.length,
    [selectedDays],
  );

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleSelectAllDays = () => {
    const allDays = DAYS.map((d) => d.value);
    setSelectedDays((prev) => (prev.length === allDays.length ? [] : allDays));
  };

  const toggleEndDateEnabled = () => {
    setEndDateEnabled((prev) => {
      const next = !prev;
      if (!next) setEndDate("");
      return next;
    });
  };

  return {
    title,
    setTitle,
    selectedDays,
    currentMode,
    setCurrentMode,
    startDate,
    setStartDate,
    effectiveFrom,
    setEffectiveFrom,
    endDateEnabled,
    endDate,
    setEndDate,
    isReadOnly,
    isEditMode,
    isRepeatChanged,
    selectAllDays,
    toggleDay,
    toggleSelectAllDays,
    toggleEndDateEnabled,
  };
};

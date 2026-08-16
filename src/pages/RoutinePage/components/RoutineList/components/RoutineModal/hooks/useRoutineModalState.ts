import { useMemo, useState } from "react";
import type { Routine } from "@/shared/api/routine";
import type { ModalMode } from "@/shared/utils/getModalModeTitle";
import { getTodayYmd } from "@/shared/utils/formatDate";
import { hasSameDays } from "../utils";
import { DAYS } from "@/shared/constants/dateLabels";
import { useDirtyForm } from "@/shared/hooks/useDirtyForm";

// interface 는 암묵적 인덱스 시그니처가 없어 useDirtyForm 의 제약을 만족하지 못한다
type RoutineFormValues = {
  title: string;
  selectedDays: number[];
  startDate: string;
  effectiveFrom: string;
  endDateEnabled: boolean;
  endDate: string;
};

/**
 * 저장했을 때 실제로 나갈 값만 남긴다.
 *
 * 요일은 배열이라 값이 같아도 참조가 다르므로, 고른 순서와 상관없이 같은 묶음이면
 * 같게 보이도록 정렬해 문자열로 만든다.
 * 종료일을 꺼 두면 endDate 가 저장에 실리지 않으므로 그때의 날짜 변화는 무시한다.
 * 적용 시작일(effectiveFrom)은 반복 요일을 바꿨을 때만 쓰이는데, 그 경우 days 가
 * 이미 달라져 dirty 이므로 따로 비교하지 않아도 된다.
 */
const toComparableRoutineValues = (values: RoutineFormValues) => ({
  title: values.title.trim(),
  days: [...values.selectedDays].sort((a, b) => a - b).join(","),
  startDate: values.startDate,
  endDate: values.endDateEnabled ? values.endDate : undefined,
});

export const useRoutineModalState = ({
  mode,
  routine,
}: {
  mode: ModalMode;
  routine?: Routine;
}) => {
  const form = useDirtyForm<RoutineFormValues>(
    {
      title: routine?.title ?? "",
      selectedDays: routine?.days ?? [],
      // toISOString()은 UTC 기준이라 KST 오전 9시 이전에는 어제 날짜가 되므로
      // 로컬 날짜 헬퍼를 사용한다
      startDate: routine?.startDate ?? getTodayYmd(),
      effectiveFrom: getTodayYmd(),
      endDateEnabled: Boolean(routine?.endDate),
      endDate: routine?.endDate ?? "",
    },
    { comparable: toComparableRoutineValues },
  );
  const {
    title,
    selectedDays,
    startDate,
    effectiveFrom,
    endDateEnabled,
    endDate,
  } = form.values;
  const [currentMode, setCurrentMode] = useState<ModalMode>(mode);

  const setTitle = (value: string) => form.patch({ title: value });
  const setStartDate = (value: string) => form.patch({ startDate: value });
  const setEffectiveFrom = (value: string) =>
    form.patch({ effectiveFrom: value });
  const setEndDate = (value: string) => form.patch({ endDate: value });

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
    form.patch((prev) => ({
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const toggleSelectAllDays = () => {
    const allDays = DAYS.map((d) => d.value);
    form.patch((prev) => ({
      selectedDays: prev.selectedDays.length === allDays.length ? [] : allDays,
    }));
  };

  const toggleEndDateEnabled = () => {
    form.patch((prev) => {
      const next = !prev.endDateEnabled;
      // 끄면 고르던 날짜도 함께 비운다. 남겨 두면 다시 켰을 때 예전 값이 되살아난다.
      return next
        ? { endDateEnabled: true }
        : { endDateEnabled: false, endDate: "" };
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
    isDirty: form.isDirty,
    resetForm: form.reset,
    isRepeatChanged,
    selectAllDays,
    toggleDay,
    toggleSelectAllDays,
    toggleEndDateEnabled,
  };
};

import { Space10, Space8 } from "@/shared/ui/Space";
import { ModalWrapper } from "@/shared/ui/Modal";
import type { RoutineModalProps } from "./types";
import { useRoutineModalState } from "./hooks/useRoutineModalState";
import { useRoutineModalActions } from "./hooks/useRoutineModalActions";
import { ModalTitle } from "./components/ModalTitle";
import { TitleField } from "./components/TitleField";
import { RepeatDaysField } from "./components/RepeatDaysField";
import { StartDateField } from "./components/StartDateField";
import { EndDateField } from "./components/EndDateField";
import { ButtonSection } from "./components/ButtonSection";

export default function RoutineModal({
  mode = "CREATE",
  routine,
  categoryId,
  onClose,
}: RoutineModalProps) {
  const state = useRoutineModalState({ mode, routine });
  const { handleSubmit, handleDelete } = useRoutineModalActions({
    routine,
    categoryId,
    onClose,
  });

  const onSubmit = () =>
    handleSubmit({
      mode: state.currentMode,
      title: state.title,
      selectedDays: state.selectedDays,
      startDate: state.startDate,
      effectiveFrom: state.effectiveFrom,
      endDateEnabled: state.endDateEnabled,
      endDate: state.endDate,
      isRepeatChanged: state.isRepeatChanged,
    });

  return (
    <ModalWrapper onClose={onClose}>
      {/* 모달 타이틀 */}
      <ModalTitle mode={state.currentMode} />
      <Space10 direction="mb" />

      {/* 루틴명 */}
      <TitleField
        title={state.title}
        isReadOnly={state.isReadOnly}
        isComposing={state.isComposing}
        setTitle={state.setTitle}
        setIsComposing={state.setIsComposing}
        onSubmit={onSubmit}
      />
      <Space8 direction="mb" />

      {/* 반복 요일 */}
      <RepeatDaysField
        isReadOnly={state.isReadOnly}
        selectAllDays={state.selectAllDays}
        selectedDays={state.selectedDays}
        toggleSelectAllDays={state.toggleSelectAllDays}
        toggleDay={state.toggleDay}
      />
      <Space8 direction="mb" />

      {/* 시작 날짜 */}
      <StartDateField
        mode={state.currentMode}
        routine={routine}
        startDate={state.startDate}
        setStartDate={state.setStartDate}
        isReadOnly={state.isReadOnly}
        isRepeatChanged={state.isRepeatChanged}
        effectiveFrom={state.effectiveFrom}
        setEffectiveFrom={state.setEffectiveFrom}
        endDateEnabled={state.endDateEnabled}
        endDate={state.endDate}
        setEndDate={state.setEndDate}
      />
      <Space8 direction="mb" />

      {/* 종료 날짜 */}
      <EndDateField
        isReadOnly={state.isReadOnly}
        endDateEnabled={state.endDateEnabled}
        endDate={state.endDate}
        startDate={state.startDate}
        routineEndDate={routine?.endDate}
        toggleEndDateEnabled={state.toggleEndDateEnabled}
        setEndDate={state.setEndDate}
      />
      <Space10 direction="mb" />

      {/* 버튼 영역 */}
      <ButtonSection
        mode={state.currentMode}
        onClose={onClose}
        onEdit={() => state.setCurrentMode("EDIT")}
        onSubmit={onSubmit}
        onDelete={handleDelete}
      />
    </ModalWrapper>
  );
}

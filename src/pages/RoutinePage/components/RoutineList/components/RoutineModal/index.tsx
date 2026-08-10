import { ModalWrapper } from "@/shared/ui/Modal";
import type { RoutineModalProps } from "./types";
import { useRoutineModalState } from "./hooks/useRoutineModalState";
import { useRoutineModalActions } from "./hooks/useRoutineModalActions";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { getModalModeTitle } from "@/shared/utils/getModalModeTitle";
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
  const { handleSubmit, handleDelete, isSubmitting } = useRoutineModalActions({
    routine,
    categoryId,
    onClose,
  });

  const onSubmit = () =>
    void handleSubmit({
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
    <ModalWrapper onClose={isSubmitting ? () => {} : onClose}>
      {/* 모달 타이틀 */}
      <ModalTitle text={getModalModeTitle(state.currentMode, "루틴")} />

      {/* 입력 항목 사이 간격은 이 묶음이 소유한다 */}
      <div className="mb-10 flex flex-col gap-8">
        {/* 루틴명 */}
        <TitleField
          title={state.title}
          isReadOnly={state.isReadOnly || isSubmitting}
          setTitle={state.setTitle}
          onSubmit={onSubmit}
        />

        {/* 반복 요일 */}
        <RepeatDaysField
          isReadOnly={state.isReadOnly}
          selectAllDays={state.selectAllDays}
          selectedDays={state.selectedDays}
          toggleSelectAllDays={state.toggleSelectAllDays}
          toggleDay={state.toggleDay}
        />

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
      </div>

      {/* 버튼 영역 */}
      <ButtonSection
        mode={state.currentMode}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onEdit={() => state.setCurrentMode("EDIT")}
        onSubmit={onSubmit}
        onDelete={() => void handleDelete()}
      />
    </ModalWrapper>
  );
}

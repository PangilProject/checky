import { Text } from "@/shared/ui/primitives";
import { DatePicker } from "@/shared/ui/DatePicker";
import type { Routine } from "@/shared/api/routine";
import type { ModalMode } from "@/shared/utils/getModalModeTitle";

/**
 * 이 칸이 무엇을 묻고 있는가.
 *
 * "시작 날짜"라는 한 칸이 상황에 따라 다른 일을 한다. 예전에는 mode·isReadOnly·
 * isRepeatChanged 세 값을 본문에서 겹쳐 물어 4중 삼항이 됐는데, 어떤 조합이
 * 어느 화면인지 읽어 내기 어려웠다. 상태를 먼저 하나로 정하고 그 다음에 그린다.
 */
type StartDateFieldMode =
  /** 상세: 시작일을 보여 주기만 한다 */
  | "READ"
  /** 수정 중이지만 반복 요일은 그대로: 시작일은 못 바꾼다 (지난 기록이 틀어진다) */
  | "LOCKED"
  /** 수정 중이고 반복 요일을 바꿨다: 새 요일을 언제부터 적용할지 고른다 */
  | "PICK_EFFECTIVE_FROM"
  /** 작성 중: 시작일을 고른다 */
  | "PICK_START";

const resolveFieldMode = ({
  mode,
  isReadOnly,
  isRepeatChanged,
}: {
  mode: ModalMode;
  isReadOnly: boolean;
  isRepeatChanged: boolean;
}): StartDateFieldMode => {
  if (isReadOnly) return "READ";
  if (mode !== "EDIT") return "PICK_START";
  return isRepeatChanged ? "PICK_EFFECTIVE_FROM" : "LOCKED";
};

interface StartDateFieldProps {
  mode: ModalMode;
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
  const fieldMode = resolveFieldMode({ mode, isReadOnly, isRepeatChanged });

  return (
    <div>
      <Text variant="body" className="mb-2 font-bold">
        {fieldMode === "PICK_EFFECTIVE_FROM" ? "변경 적용 날짜" : "시작 날짜"}
      </Text>

      {fieldMode === "READ" && (
        <Text variant="bodySm" className="text-content">
          {startDate}
        </Text>
      )}

      {fieldMode === "LOCKED" && (
        <Text variant="bodySm" className="text-content">
          {routine?.startDate ?? startDate}
        </Text>
      )}

      {fieldMode === "PICK_EFFECTIVE_FROM" && (
        <DatePicker
          value={effectiveFrom}
          // 루틴이 시작하기도 전의 날짜부터 새 요일을 적용할 수는 없다
          min={routine?.startDate}
          onChange={setEffectiveFrom}
        />
      )}

      {fieldMode === "PICK_START" && (
        <DatePicker
          value={startDate}
          onChange={(next) => {
            setStartDate(next);
            // 시작일이 종료일을 넘어서면 종료일도 함께 민다
            if (endDateEnabled && endDate && endDate < next) {
              setEndDate(next);
            }
          }}
        />
      )}
    </div>
  );
};

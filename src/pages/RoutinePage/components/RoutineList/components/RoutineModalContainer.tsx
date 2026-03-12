import type { Routine } from "@/shared/api/routine";
import RoutineModal from "./RoutineModal";

type Props = {
  isModalOpen: boolean;
  selectedCategoryId: string | null;
  selectedRoutine: Routine | null;
  onClose: () => void;
  setSelectedRoutine: (routine: Routine | null) => void;
};

/**
 * 루틴 모달 렌더링을 담당하는 컨테이너 컴포넌트
 */

export const RoutineModalContainer = ({
  isModalOpen,
  selectedCategoryId,
  selectedRoutine,
  onClose,
  setSelectedRoutine,
}: Props) => {
  return (
    <>
      {/* CREATE 모달 */}
      {/* - 카테고리가 선택된 상태 + 루틴이 선택되지 않은 경우 */}
      {isModalOpen && selectedCategoryId && !selectedRoutine && (
        <RoutineModal
          mode="CREATE"
          categoryId={selectedCategoryId}
          onClose={onClose}
        />
      )}

      {/* VIEW / EDIT 모달 */}
      {/* - 특정 루틴이 선택된 경우 (상세 조회 및 수정 모드) */}
      {selectedRoutine && (
        <RoutineModal
          mode="VIEW"
          routine={selectedRoutine}
          categoryId={selectedRoutine.categoryId}
          onClose={() => setSelectedRoutine(null)}
        />
      )}
    </>
  );
};

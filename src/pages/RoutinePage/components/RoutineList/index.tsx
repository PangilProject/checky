import { useAuth } from "@/shared/hooks/useAuth";
import { useState } from "react";
import { useRoutineData } from "./hooks/useRoutineData";
import { useRoutineDnD } from "./hooks/useRoutineDnD";
import { useRoutineModal } from "./hooks/useRoutineModal";
import { type RoutineCategory } from "@/shared/api/routine";
import { RoutineListSkeleton } from "./components/RoutineListSkeleton";
import EmptyRoutineList from "./components/EmptyRoutineList";
import { RoutineCategorySection } from "./components/RoutineCategorySection";
import { RoutineModalContainer } from "./components/RoutineModalContainer";
import { NormalBlackButton } from "@/shared/ui/Button";

/**
 * 루틴 목록을 카테고리별로 표시하고 관리하는 컴포넌트
 */
export const RoutineList = () => {
  const { user } = useAuth();
  const userId = user?.uid ?? "";

  // 카테고리 및 루틴 정보
  const [routineCategories, setRoutineCategories] = useState<
    RoutineCategory[] | null
  >(null);

  // hooks
  const { data, isError, refetch } = useRoutineData(userId, !!user);
  const { handleDragEnd } = useRoutineDnD(userId, setRoutineCategories);
  const modal = useRoutineModal();

  /**
   * 서버에서 가져온 루틴 데이터를 로컬 상태로 동기화
   * 이후 드래그 앤 드롭 시 UI를 즉시 반영하기 위해 (Optimistic UI)
   * React Query 캐시와 UI 상태를 분리하여 사용자 경험 개선
   * (effect 대신 렌더 중 상태 조정 패턴으로 불필요한 중간 렌더를 방지)
   */
  const [syncedData, setSyncedData] = useState<RoutineCategory[] | undefined>(
    undefined
  );
  if (data !== syncedData) {
    setSyncedData(data);
    if (data) setRoutineCategories(data);
  }

  /**
   * Early Returns
   */
  // 조회 실패: 무한 스켈레톤 대신 재시도 안내를 보여준다
  if (!routineCategories && isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <p className="text-sm text-content-muted">루틴을 불러오지 못했습니다.</p>
        <NormalBlackButton text="다시 시도" onClick={() => void refetch()} />
      </div>
    );
  }

  // 데이터가 아직 로딩되지 않은 상태 (null)
  if (!routineCategories) return <RoutineListSkeleton />;

  // 데이터는 로딩되었지만, 루틴이 하나도 없는 상태
  if (routineCategories.length === 0) return <EmptyRoutineList />;

  return (
    <div>
      {/* 루틴 목록*/}
      {routineCategories.map(({ category, routines }) => (
        <RoutineCategorySection
          key={category.id}
          category={category}
          routines={routines}
          onAdd={() => modal.openCreate(category.id)}
          onSelect={modal.setSelectedRoutine}
          onDragEnd={(e) => handleDragEnd(e, routines, category.id)}
        />
      ))}

      {/* 루틴 모달 */}
      <RoutineModalContainer
        isModalOpen={modal.isModalOpen}
        selectedCategoryId={modal.selectedCategoryId}
        selectedRoutine={modal.selectedRoutine}
        onClose={modal.close}
        setSelectedRoutine={modal.setSelectedRoutine}
      />
    </div>
  );
};

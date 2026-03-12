import { useAuth } from "@/shared/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRoutineData } from "./hooks/useRoutineData";
import { useRoutineDnD } from "./hooks/useRoutineDnD";
import { useRoutineModal } from "./hooks/useRoutineModal";
import {
  migrateRoutineOrderIndex,
  type RoutineCategory,
} from "@/shared/api/routine";
import { RoutineListSkeleton } from "./components/RoutineListSkeleton";
import EmptyRoutineList from "./components/EmptyRoutineList";
import { RoutineCategorySection } from "./components/RoutineCategorySection";
import { RoutineModalContainer } from "./components/RoutineModalContainer";

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
  const { data } = useRoutineData(userId, !!user);
  const { handleDragEnd } = useRoutineDnD(userId, setRoutineCategories);
  const modal = useRoutineModal();

  /**
   * hook: 기존 루틴 데이터에 orderIndex가 없는 경우 초기 정렬값을 세팅
   * 드래그 앤 드롭 정렬 기능 도입 이후, 데이터 정합성을 맞추기 위한 마이그레이션
   * 사용자 로그인 시 한 번만 실행
   */
  useEffect(() => {
    if (!user) return;
    migrateRoutineOrderIndex(user.uid);
  }, [user]);

  /**
   * hook: 서버에서 가져온 루틴 데이터를 로컬 상태로 동기화
   * 이후 드래그 앤 드롭 시 UI를 즉시 반영하기 위해 (Optimistic UI)
   * React Query 캐시와 UI 상태를 분리하여 사용자 경험 개선
   */
  useEffect(() => {
    if (data) setRoutineCategories(data);
  }, [data]);

  /**
   * Early Returns
   */
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

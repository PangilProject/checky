import { useState } from "react";
import type { Routine } from "@/shared/api/routine";

/**
 * 루틴 생성 / 조회 모달 상태를 관리하는 커스텀 훅
 */

export const useRoutineModal = () => {
  // 생성 모달 열림 여부
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 생성 시 대상 카테고리 ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  // 상세 보기 / 수정 대상 루틴
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  /**
   * 생성 모달 오픈
   * - 카테고리를 지정하고 모달 활성화
   */
  const openCreate = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsModalOpen(true);
  };

  /**
   * 모달 닫기 (모든 상태 초기화)
   * - 생성 모달, 상세 모달 상태 모두 reset
   */
  const close = () => {
    setSelectedCategoryId(null);
    setIsModalOpen(false);
    setSelectedRoutine(null);
  };

  return {
    isModalOpen,
    selectedCategoryId,
    selectedRoutine,
    setSelectedRoutine,
    openCreate,
    close,
  };
};

import { getCategories, type Category } from "@/shared/api/category";
import {
  subscribeRoutinesByCategory,
  type Routine,
  type RoutineCategory,
} from "@/shared/api/routine";
import { useAuth } from "@/shared/hooks/useAuth";
import { NormalBlackButton } from "@/shared/ui/Button";
import { Space10 } from "@/shared/ui/Space";
import { TitleText } from "@/shared/ui/TitleText";
import { useEffect, useRef, useState } from "react";
import RoutineModal from "./RoutineModal";

export const RoutineList = () => {
  const { user } = useAuth();
  const [routineCategories, setRoutineCategories] = useState<RoutineCategory[]>(
    []
  );

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // 🔑 routines 구독 해제 관리
  const routineUnsubscribes = useRef<Record<string, () => void>>({});

  const handleOpenModal = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategoryId(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!user) return;

    // 1️⃣ 카테고리 subscribe
    const unsubscribeCategories = getCategories({
      userId: user.uid,
      status: "ACTIVE",
      onChange: (categories) => {
        setRoutineCategories((prev) => {
          // 기존 state 유지하면서 category 갱신
          return categories.map((category) => {
            const existing = prev.find(
              (item) => item.category.id === category.id
            );

            return (
              existing ?? {
                category,
                routines: [],
              }
            );
          });
        });

        // 2️⃣ 각 카테고리별 루틴 subscribe
        categories.forEach((category) => {
          if (routineUnsubscribes.current[category.id]) return;

          const unsubscribeRoutine = subscribeRoutinesByCategory({
            userId: user.uid,
            categoryId: category.id,
            onChange: (routines) => {
              setRoutineCategories((prev) =>
                prev.map((item) =>
                  item.category.id === category.id
                    ? { ...item, routines }
                    : item
                )
              );
            },
          });

          routineUnsubscribes.current[category.id] = unsubscribeRoutine;
        });
      },
    });

    return () => {
      unsubscribeCategories();
      Object.values(routineUnsubscribes.current).forEach((unsub) => unsub());
      routineUnsubscribes.current = {};
    };
  }, [user]);

  return (
    <div>
      {routineCategories.map(({ category, routines }) => {
        const textColor = `text-[${category.color}]`;

        return (
          <div key={category.id}>
            {/* 카테고리 헤더 */}
            <div className="flex justify-between items-center">
              <TitleText text={category.name} className={textColor} />
              <NormalBlackButton
                text="추가"
                onClick={() => handleOpenModal(category.id)}
              />
            </div>

            <Space10 direction="mb" />

            {/* 루틴 리스트 */}
            <div className="flex flex-col gap-2">
              {routines.map((routine) => (
                <div key={routine.id}>{routine.title}</div>
              ))}
            </div>

            <Space10 direction="mb" />
          </div>
        );
      })}

      {isModalOpen && selectedCategoryId && (
        <RoutineModal
          categoryId={selectedCategoryId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

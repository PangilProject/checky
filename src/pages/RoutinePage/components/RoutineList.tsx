import { getCategories } from "@/shared/api/category";
import {
  subscribeRoutinesByCategory,
  type RoutineCategory,
  type Routine,
} from "@/shared/api/routine";
import { useAuth } from "@/shared/hooks/useAuth";
import { NormalBlackButton } from "@/shared/ui/Button";
import { Space10, Space2 } from "@/shared/ui/Space";
import { TitleText } from "@/shared/ui/TitleText";
import { useEffect, useRef, useState } from "react";
import RoutineModal from "./RoutineModal";
import { Text2, Text3 } from "@/shared/ui/Text";
import { HiDotsHorizontal } from "react-icons/hi";
import { getDayLabel } from "@/shared/constants/da";

export const RoutineList = () => {
  const { user } = useAuth();
  const [routineCategories, setRoutineCategories] = useState<RoutineCategory[]>(
    []
  );

  // 생성 모달을 위한 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const routineUnsubscribes = useRef<Record<string, () => void>>({});

  const handleOpenModal = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategoryId(null);
    setIsModalOpen(false);
  };

  // 상세, 수정 모달을 위한 상태 관리
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribeCategories = getCategories({
      userId: user.uid,
      status: "ACTIVE",
      onChange: (categories) => {
        setRoutineCategories((prev) => {
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

            {/* 루틴 리스트 */}
            <div className="flex flex-col">
              {routines.map((routine) => (
                <RoutineItem
                  routine={routine}
                  key={routine.id}
                  onClickMore={() => {
                    setIsModalOpen(false);
                    setSelectedCategoryId(null);
                    setSelectedRoutine(routine);
                  }}
                />
              ))}
            </div>

            <Space10 direction="mb" />
          </div>
        );
      })}

      {/* CREATE */}
      {isModalOpen && selectedCategoryId && !selectedRoutine && (
        <RoutineModal
          mode="CREATE"
          categoryId={selectedCategoryId}
          onClose={handleCloseModal}
        />
      )}

      {/* VIEW / EDIT */}
      {selectedRoutine && (
        <RoutineModal
          mode="VIEW"
          routine={selectedRoutine}
          categoryId={selectedRoutine.categoryId}
          onClose={() => setSelectedRoutine(null)}
        />
      )}
    </div>
  );
};

interface RoutineItemProps {
  routine: Routine;
  onClickMore: () => void;
}
const RoutineItem = ({ routine, onClickMore }: RoutineItemProps) => {
  return (
    <div className="w-full flex flex-col hover:bg-gray-100">
      <Space2 direction="mb" />
      <div className="flex justify-between items-center w-full ">
        <div className="flex flex-col">
          <Text3 text={routine.title} className="font-bold" />
          <div className="flex gap-2">
            {routine.days
              .sort((a, b) => a - b)
              .map((day, index) => (
                <Text2
                  key={index}
                  className="text-[#8E8E93]"
                  text={getDayLabel(day)}
                />
              ))}
          </div>
        </div>
        <button onClick={onClickMore} className="pressable">
          <HiDotsHorizontal color="#8E8E93" size={20} />
        </button>
      </div>
      <Space2 direction="mb" />
    </div>
  );
};

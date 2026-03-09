import { getCategoriesOnce } from "@/shared/api/category";
import {
  type RoutineCategory,
  type Routine,
  getRoutinesByCategory,
  updateRoutineOrder,
  migrateRoutineOrderIndex,
} from "@/shared/api/routine";
import { useAuth } from "@/shared/hooks/useAuth";
import { NormalBlackButton } from "@/shared/ui/Button";
import { Space10, Space2, Space4 } from "@/shared/ui/Space";
import { TitleText } from "@/shared/ui/TitleText";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RoutineModal from "./RoutineModal";
import { Text2, Text3, Text4 } from "@/shared/ui/Text";
import { HiDotsHorizontal } from "react-icons/hi";
import { getDayLabel } from "@/shared/constants/da";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import ImageEmpty from "@/assets/images/empty.png";
import { Link } from "react-router-dom";
import { RiCheckboxBlankFill } from "react-icons/ri";
import { RoutineListSkeleton } from "./RoutineListSkeleton";

export const RoutineList = () => {
  const { user } = useAuth();
  const [routineCategories, setRoutineCategories] = useState<
    RoutineCategory[] | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  // 생성 모달을 위한 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const safeUserId = user?.uid ?? "";

  const routineDataQuery = useQuery({
    queryKey: ["routinePageData", safeUserId],
    queryFn: async () => {
      const categories = await getCategoriesOnce({
        userId: safeUserId,
        status: "ACTIVE",
      });

      const routinesByCategory = await Promise.all(
        categories.map(async (category) => ({
          category,
          routines: await getRoutinesByCategory({
            userId: safeUserId,
            categoryId: category.id,
          }),
        }))
      );

      return routinesByCategory;
    },
    enabled: Boolean(user?.uid),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previous) => previous,
  });

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
    migrateRoutineOrderIndex(user.uid);
  }, [user]);

  useEffect(() => {
    if (!routineDataQuery.data) return;
    setRoutineCategories(routineDataQuery.data);
  }, [routineDataQuery.data]);
  if (routineCategories === null) {
    return (
      <div>
        <Text4 text="루틴 페이지" className="font-bold mb-5" />
        <Space4 direction="mb" />
        <RoutineListSkeleton />
      </div>
    );
  }
  if (routineCategories.length === 0) {
    return (
      <div>
        <Text4 text="루틴 페이지" className="font-bold mb-5" />
        <Space4 direction="mb" />
        <div className="flex flex-col items-center">
          <img src={ImageEmpty} className="h-15" />
          <Space4 direction="mb" />
          <Text2 text="추가된 카테고리가 없습니다." className="text-gray-400" />
          <Text2
            text={`"카테고리 페이지에서 루틴을 추가해보세요.`}
            className="text-gray-400"
          />
          <Space2 direction="mb" />
          <Link
            to="/category"
            className="text-xs text-blue-400 hover:text-blue-200"
          >
            추가하러 가기
          </Link>
          <Space10 direction="mb" />
        </div>
      </div>
    );
  }
  return (
    <div>
      {routineCategories.map(({ category, routines }) => {
        const handleDragEnd = (event: DragEndEvent) => {
          const { active, over } = event;
          if (!over || active.id === over.id) return;

          const oldIndex = routines.findIndex((r) => r.id === active.id);
          const newIndex = routines.findIndex((r) => r.id === over.id);

          const newList = arrayMove(routines, oldIndex, newIndex);

          setRoutineCategories((prev) => {
            const safePrev = prev ?? [];
            return safePrev.map((item) =>
              item.category.id === category.id
                ? { ...item, routines: newList }
                : item
            );
          });

          updateRoutineOrder({
            userId: user!.uid,
            routines: newList.map((r, index) => ({
              id: r.id,
              orderIndex: index,
            })),
          });
        };

        const textColor = `text-[${category.color}]`;

        return (
          <div key={category.id}>
            <div className="flex justify-between items-center">
              <TitleText text={category.name} className={textColor} />
              <NormalBlackButton
                text="추가"
                onClick={() => handleOpenModal(category.id)}
              />
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={routines.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {routines.length === 0 ? (
                  <div className="flex flex-col items-center">
                    <Space4 direction="mb" />
                    <img src={ImageEmpty} className="h-15" />
                    <Space4 direction="mb" />
                    <Text2
                      text="추가된 루틴이 없습니다."
                      className="text-gray-400"
                    />
                    <Space10 direction="mb" />
                  </div>
                ) : (
                  routines.map((routine) => (
                    <div key={routine.id} className="py-2">
                      <RoutineItem
                        routine={routine}
                        onClickMore={() => setSelectedRoutine(routine)}
                      />
                    </div>
                  ))
                )}
              </SortableContext>
            </DndContext>

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

export const RoutineItem = ({ routine, onClickMore }: RoutineItemProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-full flex flex-col
        cursor-grab 
        transition-all duration-200 ease-out
        ${isDragging ? "bg-white shadow-xl scale-[1.01]" : "hover:bg-gray-100"}
      `}
    >
      <div className="flex justify-between items-center w-full ">
        <div className="flex items-center">
          <RiCheckboxBlankFill size={10} />
          <Space2 direction="mr" />
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
        </div>
        <button onClick={onClickMore} className="pressable">
          <HiDotsHorizontal color="#8E8E93" size={20} />
        </button>
      </div>
    </div>
  );
};

import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { updateCategoryOrder, type Category } from "@/shared/api/category";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
import { useDebouncedCommit } from "@/shared/hooks/useDebouncedCommit";
import { TitleText } from "@/shared/ui/TitleText";
import { NormalBlackButton } from "@/shared/ui/Button";
import { Space10, Space4 } from "@/shared/ui/Space";
import { Text2 } from "@/shared/ui/Text";
import ImageEmpty from "@/assets/images/empty.png";
import { SortableCategoryItem } from "./SortableCategoryItem";
import CategoryModal from "./CategoryModal";
import { CategoryListSkeleton } from "./CategoryListSkeleton";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  useSensor,
  DndContext,
  closestCenter,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { toast } from "react-toastify";

interface CategorySectionProps {
  title: string;
  status: "ACTIVE" | "ENDED";
  emptyTitle: string;
  emptySubTitle?: string;
  showAddButton?: boolean;
}

export const CategorySection = ({
  title,
  status,
  emptyTitle,
  emptySubTitle,
  showAddButton = false,
}: CategorySectionProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const safeUserId = user?.uid ?? "";
  const { schedule: scheduleOrderCommit } = useDebouncedCommit();

  // 정본 카테고리 캐시에서 status 로 걸러 쓴다. ACTIVE/ENDED 두 섹션이
  // 각각 서버를 조회하지 않고 같은 캐시 한 벌을 나눠 쓴다.
  const categoriesQuery = useCategoriesQuery(safeUserId, {
    status,
    enabled: Boolean(user?.uid),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150, // 150ms 이상 눌러야 drag 시작
        tolerance: 5, // 5px 움직여도 drag 유지
      },
    })
  );

  // 서버 데이터를 로컬 상태로 동기화 (드래그 정렬 낙관적 반영용)
  const [syncedData, setSyncedData] = useState<Category[] | undefined>(
    undefined
  );
  if (categoriesQuery.data !== syncedData) {
    setSyncedData(categoriesQuery.data);
    if (categoriesQuery.data) setCategories(categoriesQuery.data);
  }

  if (!user) return null;

  const saveCategoryOrder = (list: Category[]) => {
    if (!user) return;

    // 연속 드래그를 마지막 상태 한 번으로 합쳐 저장한다. 화면은 로컬 상태로 이미 반영됐다.
    scheduleOrderCommit(`categories:${status}`, () =>
      updateCategoryOrder({
        userId: user.uid,
        categories: list.map((c, index) => ({
          id: c.id,
          orderIndex: index,
        })),
      }).catch(() => {
        // 저장 실패 시 화면 순서만 바뀐 채 어긋나는 것을 막는다
        toast.error("순서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        void categoriesQuery.refetch();
      }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !categories) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newList = arrayMove(categories, oldIndex, newIndex);

    // setState 업데이터가 두 번 호출될 수 있으므로 저장은 밖에서 한 번만 수행
    setCategories(newList);
    saveCategoryOrder(newList);
  };

  return (
    <div className="w-full flex flex-col">
      {/* 타이틀 영역 */}
      <div className="flex items-center justify-between">
        <TitleText text={title} />
        {showAddButton && (
          <>
            <NormalBlackButton text="추가" onClick={() => setIsOpen(true)} />
            {isOpen && (
              <CategoryModal mode="CREATE" onClose={() => setIsOpen(false)} />
            )}
          </>
        )}
      </div>

      <Space4 direction="mb" />

      {/* 내용 영역 */}
      <div className="w-full flex flex-col items-center">
        {categories === null && categoriesQuery.isError ? (
          <div className="flex flex-col items-center">
            <img src={ImageEmpty} className="h-15" alt="" />
            <Space4 direction="mb" />
            <Text2
              text="카테고리를 불러오지 못했습니다."
              className="text-gray-400"
            />
            <Space4 direction="mb" />
            <NormalBlackButton
              text="다시 시도"
              onClick={() => void categoriesQuery.refetch()}
            />
            <Space10 direction="mb" />
          </div>
        ) : categories === null ? (
          <CategoryListSkeleton />
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center">
            <img src={ImageEmpty} className="h-15" alt="" />
            <Space4 direction="mb" />
            <Text2 text={emptyTitle} className="text-gray-400" />
            {emptySubTitle && (
              <Text2 text={emptySubTitle} className="text-gray-400" />
            )}
            <Space10 direction="mb" />
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((category) => (
                <SortableCategoryItem key={category.id} category={category} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { updateCategoryOrder, type Category } from "@/shared/api/category";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
import { useDebouncedCommit } from "@/shared/hooks/useDebouncedCommit";
import { TitleText } from "@/shared/ui/TitleText";
import { Space10, Space4 } from "@/shared/ui/Space";
import { Button, Text } from "@/shared/ui/primitives";
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
  /**
   * 비어 있으면 섹션째 감춘다.
   *
   * 종료된 카테고리처럼 아직 만들어 본 적 없는 사용자에게는 채워질 수 없는
   * 섹션이 있다. 첫 화면에서 "없습니다"가 두 번 반복되면 시작하는 방법보다
   * 비어 있다는 사실이 먼저 읽힌다.
   */
  hideWhenEmpty?: boolean;
}

export const CategorySection = ({
  title,
  status,
  emptyTitle,
  emptySubTitle,
  showAddButton = false,
  hideWhenEmpty = false,
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
    }),
  );

  // 서버 데이터를 로컬 상태로 동기화 (드래그 정렬 낙관적 반영용)
  const [syncedData, setSyncedData] = useState<Category[] | undefined>(
    undefined,
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

  // 감출 섹션은 로딩 자리도 만들지 않는다. 잠깐 나타났다 사라지면 더 어수선하다.
  if (hideWhenEmpty && (categories === null || categories.length === 0)) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      {/* 타이틀 영역 */}
      <div className="flex items-center justify-between">
        <TitleText text={title} />
        {showAddButton && (
          <>
            <Button onClick={() => setIsOpen(true)}>추가</Button>
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
            <Text variant="bodySm" tone="muted">
              카테고리를 불러오지 못했습니다.
            </Text>
            <Space4 direction="mb" />
            <Button onClick={() => void categoriesQuery.refetch()}>
              다시 시도
            </Button>
            <Space10 direction="mb" />
          </div>
        ) : categories === null ? (
          <CategoryListSkeleton />
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center">
            <img src={ImageEmpty} className="h-15" alt="" />
            <Space4 direction="mb" />
            <Text variant="bodySm" tone="muted">
              {emptyTitle}
            </Text>
            {emptySubTitle && (
              <Text variant="bodySm" tone="muted">
                {emptySubTitle}
              </Text>
            )}
            {/* 안내문이 가리키는 버튼을 안내문 옆에 둔다.
                제목 줄의 "추가"만 있으면 무엇을 눌러야 하는지 눈으로 잇기 어렵다. */}
            {showAddButton && (
              <>
                <Space4 direction="mb" />
                <Button onClick={() => setIsOpen(true)}>카테고리 추가</Button>
              </>
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

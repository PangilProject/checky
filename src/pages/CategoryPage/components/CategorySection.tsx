import { useEffect, useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  getCategories,
  updateCategoryOrder,
  type Category,
} from "@/shared/api/category";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150, // 150ms 이상 눌러야 drag 시작
        tolerance: 5, // 5px 움직여도 drag 유지
      },
    })
  );

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const unsubscribe = getCategories({
      userId: user.uid,
      status,
      onChange: (list) => {
        setCategories(list);
        setIsLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user, status]);

  if (!user) return null;

  const saveCategoryOrder = (list: Category[]) => {
    if (!user) return;

    updateCategoryOrder({
      userId: user.uid,
      categories: list.map((c, index) => ({
        id: c.id,
        orderIndex: index,
      })),
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);

      const newList = arrayMove(prev, oldIndex, newIndex);

      // 👉 여기서 DB 저장 (뒤에서 설명)
      saveCategoryOrder(newList);

      return newList;
    });
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
        {isLoading ? (
          <CategoryListSkeleton />
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center">
            <img src={ImageEmpty} className="h-15" />
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

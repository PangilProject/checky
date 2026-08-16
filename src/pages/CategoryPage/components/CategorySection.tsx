import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  applyCategoryOrderToCache,
  invalidateCategoryQueries,
  updateCategoryOrder,
  type Category,
} from "@/shared/api/category";
import { useQueryClient } from "@tanstack/react-query";
import { useCategoriesQuery } from "@/shared/hooks/useCategoriesQuery";
import { useDebouncedCommit } from "@/shared/hooks/useDebouncedCommit";
import { TitleText } from "@/shared/ui/TitleText";
import { Button, Stack, Text } from "@/shared/ui/primitives";
import ImageEmpty from "@/assets/images/empty.png";
import { SortableCategoryItem } from "./SortableCategoryItem";
import CategoryModal from "./CategoryModal";
import { CategoryListSkeleton } from "./CategoryListSkeleton";
import { SortableList } from "@/shared/ui/SortableList";
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
  const queryClient = useQueryClient();
  const { schedule: scheduleOrderCommit } = useDebouncedCommit();

  // 정본 카테고리 캐시에서 status 로 걸러 쓴다. ACTIVE/ENDED 두 섹션이
  // 각각 서버를 조회하지 않고 같은 캐시 한 벌을 나눠 쓴다.
  const categoriesQuery = useCategoriesQuery(safeUserId, {
    status,
    enabled: Boolean(user?.uid),
  });

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

    const ordered = list.map((c, index) => ({ id: c.id, orderIndex: index }));

    // 연속 드래그를 마지막 상태 한 번으로 합쳐 저장한다. 화면은 로컬 상태로 이미 반영됐다.
    scheduleOrderCommit(`categories:${status}`, () =>
      updateCategoryOrder({
        userId: user.uid,
        categories: ordered,
      })
        .then(() => {
          // 화면은 로컬 상태로 맞아 보여도 캐시에는 옛 순서가 남는다. 캐시가
          // 낡았다고 표시되지 않으므로 다시 마운트해도 서버를 읽지 않는다.
          // 무엇을 저장했는지 아는 상황이라 다시 읽지 않고 캐시를 직접 고친다.
          const applied = applyCategoryOrderToCache(
            queryClient,
            user.uid,
            ordered,
          );
          // 정본 캐시가 사라진 뒤라면 고칠 대상이 없다. 다음 마운트에서
          // 서버를 읽도록 낡음 표시만 남긴다.
          if (!applied) void invalidateCategoryQueries(queryClient, user.uid);
        })
        .catch(() => {
          // 저장 실패 시 화면 순서만 바뀐 채 어긋나는 것을 막는다
          toast.error("순서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          void categoriesQuery.refetch();
        }),
    );
  };

  const handleReorder = (newList: Category[]) => {
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
      <div className="mb-4 flex items-center justify-between">
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

      {/* 내용 영역 */}
      <div className="w-full flex flex-col items-center">
        {categories === null && categoriesQuery.isError ? (
          <Stack gap={4} direction="col" align="center" className="pb-10">
            <img src={ImageEmpty} className="h-15" alt="" />
            <Text variant="bodySm" tone="muted">
              카테고리를 불러오지 못했습니다.
            </Text>
            <Button onClick={() => void categoriesQuery.refetch()}>
              다시 시도
            </Button>
          </Stack>
        ) : categories === null ? (
          <CategoryListSkeleton />
        ) : categories.length === 0 ? (
          <Stack gap={4} direction="col" align="center" className="pb-10">
            <img src={ImageEmpty} className="h-15" alt="" />
            {/* 두 줄은 한 문단이므로 사이를 벌리지 않는다 */}
            <div className="text-center">
              <Text variant="bodySm" tone="muted">
                {emptyTitle}
              </Text>
              {emptySubTitle && (
                <Text variant="bodySm" tone="muted">
                  {emptySubTitle}
                </Text>
              )}
            </div>
            {/* 안내문이 가리키는 버튼을 안내문 옆에 둔다.
                제목 줄의 "추가"만 있으면 무엇을 눌러야 하는지 눈으로 잇기 어렵다. */}
            {showAddButton && (
              <Button onClick={() => setIsOpen(true)}>카테고리 추가</Button>
            )}
          </Stack>
        ) : (
          <SortableList
            items={categories}
            getId={(category) => category.id}
            onReorder={handleReorder}
          >
            {categories.map((category) => (
              <SortableCategoryItem key={category.id} category={category} />
            ))}
          </SortableList>
        )}
      </div>
    </div>
  );
};

import { CategorySection } from "./CategorySection";

export const ActiveCategorySection = () => {
  return (
    <CategorySection
      title="진행중인 카테고리"
      status="ACTIVE"
      emptyTitle="진행중인 카테고리가 없습니다."
      emptySubTitle="카테고리를 추가해보세요!"
      showAddButton
    />
  );
};

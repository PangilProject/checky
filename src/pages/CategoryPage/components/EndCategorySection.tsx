import { CategorySection } from "./CategorySection";

export const EndedCategorySection = () => {
  return (
    <CategorySection
      title="종료된 카테고리"
      status="ENDED"
      emptyTitle="종료된 카테고리가 없습니다."
      // 종료한 적이 없으면 섹션 자체를 감춘다. 카테고리를 처음 만드는 사용자에게는
      // 채워질 수 없는 칸이라, 첫 화면이 "없습니다"를 두 번 말하게 된다.
      hideWhenEmpty
    />
  );
};

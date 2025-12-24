import { NormalBlackButton } from "@/shared/ui/Button";
import { TitleSection } from "@/shared/ui/TitleSection";

function CategoryPage() {
  return (
    <div>
      <PageTitleSection />
    </div>
  );
}

const PageTitleSection = () => {
  return (
    <div className="flex items-center justify-between">
      <TitleSection text="진행중인 카테고리" />
      <NormalBlackButton text="추가" />
    </div>
  );
};
export default CategoryPage;

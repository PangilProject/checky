import { ActiveCategorySection } from "./components/ActiveCategorySection.tsx";
import { EndedCategorySection } from "./components/EndCategorySection.tsx";

function CategoryPage() {
  return (
    <div className="flex flex-col gap-20">
      <ActiveCategorySection />
      <EndedCategorySection />
    </div>
  );
}

export default CategoryPage;

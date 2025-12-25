import { Space20 } from "@/shared/ui/Space.tsx";
import { ActiveCategorySection } from "./components/ActiveCategorySection.tsx";
import { EndedCategorySection } from "./components/EndCategorySection.tsx";

function CategoryPage() {
  return (
    <div>
      <ActiveCategorySection />
      <Space20 direction="mb" />
      <EndedCategorySection />
    </div>
  );
}

export default CategoryPage;

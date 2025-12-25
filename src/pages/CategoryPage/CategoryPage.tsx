import { Space8 } from "@/shared/ui/Space.tsx";
import {
  ActiveCategories,
  ActiveTitleSection,
} from "./components/ActiveCategorySection.tsx";

function CategoryPage() {
  return (
    <div>
      <ActiveTitleSection />
      <Space8 direction="mb" />
      <ActiveCategories />
    </div>
  );
}

export default CategoryPage;

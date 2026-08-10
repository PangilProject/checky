import { ActiveCategorySection } from "./components/ActiveCategorySection.tsx";
import { EndedCategorySection } from "./components/EndCategorySection.tsx";
import { Stack } from "@/shared/ui/primitives";

function CategoryPage() {
  return (
    <Stack gap={20} direction="col">
      <ActiveCategorySection />
      <EndedCategorySection />
    </Stack>
  );
}

export default CategoryPage;

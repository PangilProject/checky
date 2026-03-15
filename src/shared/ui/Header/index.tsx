import { LogoSection } from "./components/LogoSection";
import { MenuSection } from "./components/MenuSection";

function Header() {
  return (
    <div className="w-full sticky top-0 z-50 bg-white flex justify-between items-center">
      <LogoSection />
      <MenuSection />
    </div>
  );
}

export default Header;

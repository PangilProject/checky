import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { Link, useLocation } from "react-router-dom";
import { Space2 } from "@/shared/ui/Space";
import { Text } from "@/shared/ui/primitives";

function AdminHeader() {
  return (
    <div className="w-full sticky top-0 z-50 bg-surface flex justify-between items-center">
      <LogoSection />
      <MenuSection />
    </div>
  );
}

const LogoSection = () => {
  const logoSrc = useLogoSrc();

  return (
    <Link to="/admin">
      <div className="flex items-center my-4">
        <img src={logoSrc} className="w-6 sm:w-8" />
        <Space2 direction="mr" />
        <span className={`block text-lg sm:hidden ${wickedMouseClass}`}>
          CHECKY
        </span>
        <span className={`hidden text-2xl sm:block ${wickedMouseClass}`}>
          CHECKY
        </span>
        <Space2 direction="mr" />
        <Text variant="bodySm" tone="accent" className="font-bold">
          ADMIN
        </Text>
      </div>
    </Link>
  );
};

const MenuSection = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex gap-3">
      {MENUS.map((menu) => {
        const isActive = pathname === menu.path;

        return (
          <Link
            key={menu.path}
            to={menu.path}
            className={`pressable ${
              isActive
                ? "font-bold text-content"
                : "font-normal text-content-muted"
            }`}
          >
            <span className="block text-base sm:hidden">{menu.label}</span>
            <span className="hidden text-lg sm:block">{menu.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

const MENUS = [
  { label: "홈", path: "/admin" },
  { label: "유저", path: "/admin/users" },
  { label: "공지", path: "/admin/notices" },
  { label: "문의", path: "/admin/reports" },
  { label: "나가기", path: "/" },
];
export default AdminHeader;

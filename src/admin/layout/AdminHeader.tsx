import { wickedMouseClass } from "@/styles/font";
import { useLogoSrc } from "@/shared/hooks/useLogoSrc";
import { Link, useLocation } from "react-router-dom";
import { Space2 } from "@/shared/ui/Space";
import { Text2, Text3, Text4, Text6 } from "@/shared/ui/Text";

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
        <Text4
          className={`block sm:hidden ${wickedMouseClass}`}
          text="CHECKY"
        />
        <Text6
          className={`hidden sm:block ${wickedMouseClass}`}
          text="CHECKY"
        />
        <Space2 direction="mr" />
        <Text2 text="ADMIN" className="text-accent font-bold" />
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
              isActive ? "font-bold text-content" : "font-normal text-content-muted"
            }`}
          >
            <Text3 text={menu.label} className="block sm:hidden" />
            <Text4 text={menu.label} className="hidden sm:block" />
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

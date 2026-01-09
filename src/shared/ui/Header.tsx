import { wickedMouseClass } from "@/styles/font";
import LogoImage from "../../assets/images/logo.png";
import { Text4, Text6 } from "./Text";
import { Space2 } from "./Space";
import { Link, useLocation } from "react-router-dom";
import { LongBlackButton } from "./Button";
import { useState } from "react";
import NoticeModal from "../notices/components/NoticeModal";

function Header() {
  return (
    <div className="w-full sticky top-0 z-50 bg-white flex justify-between items-center">
      <LogoSection />
      <MenuSection />
    </div>
  );
}

const LogoSection = () => {
  return (
    <Link to="/">
      <div className="flex items-center my-4">
        <img src={LogoImage} className="w-8" />
        <Space2 direction="mr" />
        <Text6 className={wickedMouseClass} text="CHECKY" />
      </div>
    </Link>
  );
};
const MenuSection = () => {
  const { pathname } = useLocation();
  const [openNotice, setOpenNotice] = useState(false);

  return (
    <>
      <div className="flex gap-4">
        <div className="flex gap-3">
          {MENUS.map((menu) => {
            const isActive = pathname === menu.path;

            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`pressable ${
                  isActive
                    ? "font-bold text-black"
                    : "font-normal text-[#8E8E93]"
                }`}
              >
                <Text4 text={menu.label} />
              </Link>
            );
          })}
        </div>

        <LongBlackButton
          text="공지"
          width="w-10"
          height=""
          onClick={() => setOpenNotice(true)}
        />
      </div>

      {openNotice && <NoticeModal onClose={() => setOpenNotice(false)} />}
    </>
  );
};

const MENUS = [
  { label: "홈", path: "/home" },
  { label: "카테고리", path: "/category" },
  { label: "루틴", path: "/routine" },
  { label: "마이", path: "/my" },
];
export default Header;

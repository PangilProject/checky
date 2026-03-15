import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MENUS } from "../constants";
import { Text3, Text4 } from "../../Text";
import { LongBlackButton } from "../../Button";
import NoticeModal from "@/shared/ui/notices";

export const MenuSection = () => {
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
                <Text3 text={menu.label} className="block sm:hidden" />
                <Text4 text={menu.label} className="hidden sm:block" />
              </Link>
            );
          })}
        </div>

        <LongBlackButton
          text="공지"
          width="w-10"
          height=""
          onClick={() => setOpenNotice(true)}
          className="text-xs sm:text-sm"
        />
      </div>

      {openNotice && <NoticeModal onClose={() => setOpenNotice(false)} />}
    </>
  );
};

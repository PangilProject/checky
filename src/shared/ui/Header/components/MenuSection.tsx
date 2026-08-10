import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MENUS } from "../constants";
import { Button } from "../../primitives";
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
                    ? "font-bold text-content"
                    : "font-normal text-content-muted"
                }`}
              >
                {/* 굵기는 선택 상태가 정하므로, 여기서는 크기만 반응형으로 둔다 */}
                <span className="block text-base sm:hidden">{menu.label}</span>
                <span className="hidden text-lg sm:block">{menu.label}</span>
              </Link>
            );
          })}
        </div>

        <Button
          size="none"
          onClick={() => setOpenNotice(true)}
          className="w-10 text-xs sm:text-sm"
        >
          공지
        </Button>
      </div>

      {openNotice && <NoticeModal onClose={() => setOpenNotice(false)} />}
    </>
  );
};

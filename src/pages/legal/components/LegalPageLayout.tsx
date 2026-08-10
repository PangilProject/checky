import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

/**
 * @file LegalPageLayout.tsx
 * @description 개인정보 처리방침·이용약관 페이지의 공통 껍데기.
 *
 * 이 페이지들은 로그인 전에도 열 수 있어야 하므로 앱 헤더를 쓰지 않는다.
 * 로그인 화면의 링크로 들어온 이용자에게 헤더의 메뉴는 동작하지 않는다.
 */

interface LegalPageLayoutProps {
  children: ReactNode;
}

export const LegalPageLayout = ({ children }: LegalPageLayoutProps) => {
  const navigate = useNavigate();

  /**
   * 주소를 직접 입력해 들어온 경우에는 돌아갈 이력이 없다.
   * 그때 뒤로 가면 checky 밖으로 나가버리므로 로그인 화면으로 보낸다.
   */
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="flex w-full flex-col items-center px-4 py-6">
      <div className="flex w-full max-w-200 flex-col">
        <button
          type="button"
          onClick={handleBack}
          className="-ml-2 flex w-fit items-center gap-1 rounded px-2 py-1 text-sm text-content-muted pressable hover:bg-surface-hover"
        >
          <IoChevronBack size={16} />
          돌아가기
        </button>

        <div className="my-10">{children}</div>
      </div>
    </div>
  );
};

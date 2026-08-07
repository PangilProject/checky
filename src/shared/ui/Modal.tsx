import { useEffect, type ReactNode } from "react";

interface ModalWrapperProps {
  onClose: () => void;
  children: ReactNode;
}

export const ModalWrapper = ({ onClose, children }: ModalWrapperProps) => {
  // ESC 로 닫기 (키보드 사용자 탈출 경로)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center overflow-y-auto bg-black/40 p-4 pointer-events-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        // 모바일(360px)에서도 잘리지 않도록 가변 폭 + 세로 스크롤 허용
        className="w-full max-w-120 max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

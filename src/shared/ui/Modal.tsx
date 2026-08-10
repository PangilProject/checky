import { useEffect, type ReactNode } from "react";

interface ModalWrapperProps {
  onClose: () => void;
  children: ReactNode;
}

/**
 * 열려 있는 모달 수.
 * 모달 안에서 확인 모달을 겹쳐 띄우는 경우가 있어, 안쪽 모달이 닫힐 때
 * 바깥 모달이 아직 열려 있는데도 스크롤이 풀리는 것을 막는다.
 */
let openModalCount = 0;

const lockBodyScroll = () => {
  openModalCount += 1;
  if (openModalCount > 1) return;

  const { body, documentElement } = document;
  // 스크롤바가 사라지면서 배경 레이아웃이 흔들리는 것을 막는다
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

  body.dataset.modalPrevOverflow = body.style.overflow;
  body.dataset.modalPrevPaddingRight = body.style.paddingRight;
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
};

const unlockBodyScroll = () => {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount > 0) return;

  const { body } = document;
  body.style.overflow = body.dataset.modalPrevOverflow ?? "";
  body.style.paddingRight = body.dataset.modalPrevPaddingRight ?? "";
  delete body.dataset.modalPrevOverflow;
  delete body.dataset.modalPrevPaddingRight;
};

export const ModalWrapper = ({ onClose, children }: ModalWrapperProps) => {
  // ESC 로 닫기 (키보드 사용자 탈출 경로)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 모달이 열려 있는 동안 배경 스크롤을 잠근다
  useEffect(() => {
    lockBodyScroll();
    return unlockBodyScroll;
  }, []);

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center overflow-y-auto overscroll-contain bg-overlay p-4 pointer-events-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        // 모바일(360px)에서도 잘리지 않도록 가변 폭 + 세로 스크롤 허용.
        // overscroll-contain: 내부 스크롤이 끝에 닿아도 배경으로 전파되지 않게 한다.
        className="w-full max-w-120 max-h-[90vh] overflow-y-auto overscroll-contain rounded-xl bg-surface-raised p-6 shadow-[var(--shadow-modal)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

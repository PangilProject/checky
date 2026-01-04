import type { ReactNode } from "react";

interface ModalWrapperProps {
  onClose: () => void;
  children: ReactNode;
}

export const ModalWrapper = ({ onClose, children }: ModalWrapperProps) => {
  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="w-120 rounded-xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

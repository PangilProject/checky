import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import { Space10, Space8 } from "@/shared/ui/Space";
import { RxTriangleDown, RxTriangleUp } from "react-icons/rx";
import { COLORS } from "@/shared/constants/color";
import {
  createCategory,
  endCategory,
  restoreCategory,
  updateCategory,
} from "@/shared/api/category";
import { useAuth } from "@/shared/hooks/useAuth";
import type { Category } from "./CategorySection";

interface CategoryModalProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  category?: Category; // VIEW / EDIT 시 필요
  onClose: () => void;
}

export default function CategoryModal({
  mode,
  category,
  onClose,
}: CategoryModalProps) {
  const { user } = useAuth();

  const [categoryInput, setCategoryInput] = useState(category?.name ?? "");
  const [selectedColor, setSelectedColor] = useState(
    category
      ? COLORS.find((c) => c.value === category.color) ?? COLORS[0]
      : COLORS[0]
  );
  const [currentMode, setCurrentMode] = useState(mode);

  const isReadOnly = currentMode === "VIEW";

  const handleCreateCategory = async () => {
    if (!categoryInput.trim()) return;

    const userId = user?.uid;
    try {
      if (userId)
        await createCategory({
          userId,
          name: categoryInput,
          color: selectedColor.value,
        });

      onClose();
    } catch (error) {
      console.error("카테고리 생성 실패", error);
    }
  };
  const handleUpdateCategory = async () => {
    if (!categoryInput.trim() || !category) return;

    const userId = user?.uid;
    try {
      if (userId)
        await updateCategory({
          userId,
          categoryId: category.id,
          name: categoryInput,
          color: selectedColor.value,
        });

      onClose();
    } catch (error) {
      console.error("카테고리 수정 실패", error);
    }
  };

  const handleEndCategory = async () => {
    if (!category || !user) return;

    try {
      await endCategory({
        userId: user.uid,
        categoryId: category.id,
      });

      onClose();
    } catch (error) {
      console.error("카테고리 종료 실패", error);
    }
  };

  const handleRestoreCategory = async () => {
    if (!category || !user) return;

    try {
      await restoreCategory({
        userId: user.uid,
        categoryId: category.id,
      });

      onClose();
    } catch (error) {
      console.error("카테고리 복구 실패", error);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalTitle mode={currentMode} />
      <Space10 direction="mb" />

      <Input
        categoryInput={categoryInput}
        setCategoryInput={setCategoryInput}
        disabled={isReadOnly}
      />
      <Space8 direction="mb" />

      <ColorSelector
        value={selectedColor}
        onChange={setSelectedColor}
        disabled={isReadOnly}
      />
      <Space10 direction="mb" />

      <ButtonSection
        mode={currentMode}
        categoryStatus={category?.status}
        onClose={onClose}
        onEdit={() => setCurrentMode("EDIT")}
        onSubmit={
          currentMode === "CREATE" ? handleCreateCategory : handleUpdateCategory
        }
        onEnd={handleEndCategory}
        onRestore={handleRestoreCategory}
      />
    </ModalWrapper>
  );
}

interface ModalWrapperProps {
  onClose: () => void;
  children: ReactNode;
}

export const ModalWrapper = ({ onClose, children }: ModalWrapperProps) => {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

interface ModalTitleProps {
  mode: "CREATE" | "VIEW" | "EDIT";
}
const ModalTitle = ({ mode }: ModalTitleProps) => {
  if (mode === "CREATE")
    return <Text5 text="카테고리 추가" className="font-bold" />;
  else if (mode === "EDIT")
    return <Text5 text="카테고리 수정" className="font-bold" />;
  else if (mode === "VIEW")
    return <Text5 text="카테고리 상세" className="font-bold" />;
};

interface InputProps {
  categoryInput: string;
  setCategoryInput: Dispatch<SetStateAction<string>>;
  disabled?: boolean;
}

const Input = ({ categoryInput, setCategoryInput, disabled }: InputProps) => {
  return (
    <input
      className="w-full border-0 border-b border-gray-300 text-[16px] outline-none"
      placeholder="카테고리 입력"
      value={categoryInput}
      disabled={disabled}
      onChange={(e) => setCategoryInput(e.target.value)}
    />
  );
};

interface Color {
  name: string;
  value: string;
}

interface ColorSelectorProps {
  value: Color;
  onChange: (color: Color) => void;
  disabled?: boolean;
}

const ColorSelector = ({ value, onChange, disabled }: ColorSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (disabled && isOpen) {
    setIsOpen(false);
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center">
        <Text3 text="색상" />

        <div
          className={`flex gap-2 items-center ${
            disabled ? "cursor-default" : "cursor-pointer"
          }`}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
            }
          }}
        >
          <div
            className="w-[18px] h-[18px] rounded-full"
            style={{ backgroundColor: value.value }}
          />
          {!disabled && (isOpen ? <RxTriangleUp /> : <RxTriangleDown />)}
        </div>
      </div>

      <div
        className={`
          mt-4 py-2 flex gap-3 flex-wrap justify-end
          transition-all duration-200 overflow-hidden
          ${isOpen && !disabled ? "opacity-100" : "opacity-0"}
          ${isOpen && !disabled ? "pointer-events-auto" : "pointer-events-none"}
        `}
        style={{ minHeight: 30 }}
      >
        {COLORS.map((color) => (
          <button
            key={color.name}
            className={`
              w-[18px] h-[18px] rounded-full transition-transform
              ${
                value.name === color.name
                  ? "scale-110 ring-2 ring-black"
                  : "hover:scale-110"
              }
            `}
            style={{ backgroundColor: color.value }}
            onClick={() => {
              if (disabled) return;
              onChange(color);
              setIsOpen(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface ButtonSectionProps {
  mode: "CREATE" | "VIEW" | "EDIT";
  categoryStatus?: "ACTIVE" | "ENDED";
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onEnd?: () => void;
  onRestore?: () => void;
}
const ButtonSection = ({
  mode,
  categoryStatus,
  onClose,
  onEdit,
  onSubmit,
  onEnd,
  onRestore,
}: ButtonSectionProps) => {
  // VIEW 모드
  if (mode === "VIEW") {
    // ✅ 종료된 카테고리
    if (categoryStatus === "ENDED") {
      return (
        <div className="flex justify-between">
          <NormalBlackUnFillButton text="닫기" onClick={onClose} />
          <NormalBlackButton text="복구" onClick={onRestore} />
        </div>
      );
    }

    // ✅ 진행중 카테고리
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
        <NormalRedUnFillButton text="종료" onClick={onEnd} />
        <NormalBlackButton text="수정" onClick={onEdit} />
      </div>
    );
  }

  // EDIT
  if (mode === "EDIT") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton text="취소" onClick={onClose} />
        <NormalBlackButton text="저장" onClick={onSubmit} />
      </div>
    );
  }

  // CREATE
  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton text="닫기" onClick={onClose} />
      <NormalBlackButton text="완료" onClick={onSubmit} />
    </div>
  );
};

import { useState, type Dispatch, type SetStateAction } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import { Space10, Space8 } from "@/shared/ui/Space";
import { RxTriangleDown, RxTriangleUp } from "react-icons/rx";
import { COLORS } from "@/shared/constants/colors";
import {
  createCategory,
  endCategory,
  invalidateCategoryQueries,
  restoreCategory,
  updateCategory,
} from "@/shared/api/category";
import { useAuth } from "@/shared/hooks/useAuth";
import type { Category } from "@/shared/api/category";
import { ModalWrapper } from "@/shared/ui/Modal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSubmitLock } from "@/shared/hooks/useSubmitLock";

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
  const queryClient = useQueryClient();
  const { isSubmitting, runExclusive } = useSubmitLock();

  // 저장된 값에 앞뒤 공백이 있어도 사용자에게는 정규화된 이름만 보이도록 한다.
  const [categoryInput, setCategoryInput] = useState(
    category?.name.trim() ?? "",
  );
  const [selectedColor, setSelectedColor] = useState(
    category
      ? (COLORS.find((c) => c.value === category.color) ?? COLORS[0])
      : COLORS[0],
  );
  const [currentMode, setCurrentMode] = useState(mode);

  const isReadOnly = currentMode === "VIEW";

  // 변경 감지와 저장에 같은 값을 써야 제출 방식에 따라 결과가 달라지지 않는다.
  const trimmedName = categoryInput.trim();

  // 변경 사항이 없으면 저장 버튼을 비활성화하기 위한 판단값
  const isDirty = category
    ? trimmedName !== category.name.trim() ||
      selectedColor.value !== category.color
    : true;

  /** 검증 실패 시 사유를 알리고 true를 반환한다. */
  const notifyIfInvalid = () => {
    if (trimmedName) return false;
    toast.error("카테고리명을 입력해주세요.", {
      toastId: "category-form-validation",
    });
    return true;
  };

  const handleCreateCategory = async () => {
    if (notifyIfInvalid()) return;

    const userId = user?.uid;
    if (!userId) return;

    await runExclusive(async () => {
      try {
        await createCategory({
          userId,
          name: trimmedName,
          color: selectedColor.value,
        });
        await invalidateCategoryQueries(queryClient, userId);

        onClose();
      } catch (error) {
        console.error("카테고리 생성 실패", error);
        toast.error("카테고리 저장에 실패했습니다.");
      }
    });
  };
  const handleUpdateCategory = async () => {
    if (notifyIfInvalid()) return;
    // 저장 버튼과 달리 Enter는 비활성화로 막을 수 없어 여기서도 확인한다.
    if (!isDirty) return;

    const userId = user?.uid;
    if (!userId || !category) return;

    await runExclusive(async () => {
      try {
        await updateCategory({
          userId,
          categoryId: category.id,
          name: trimmedName,
          color: selectedColor.value,
        });
        await invalidateCategoryQueries(queryClient, userId);

        onClose();
      } catch (error) {
        console.error("카테고리 수정 실패", error);
        toast.error("카테고리 수정에 실패했습니다.");
      }
    });
  };

  const handleEndCategory = async () => {
    if (!category || !user) return;

    try {
      await endCategory({
        userId: user.uid,
        categoryId: category.id,
      });
      await invalidateCategoryQueries(queryClient, user.uid);

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
      await invalidateCategoryQueries(queryClient, user.uid);

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
        onEnter={() => {
          if (currentMode === "CREATE") {
            handleCreateCategory();
            return;
          }
          if (currentMode === "EDIT") {
            handleUpdateCategory();
          }
        }}
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
        submitDisabled={isSubmitting || !isDirty}
      />
    </ModalWrapper>
  );
}

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
  onEnter?: () => void;
  disabled?: boolean;
}

const Input = ({
  categoryInput,
  setCategoryInput,
  onEnter,
  disabled,
}: InputProps) => {
  return (
    <input
      className="w-full border-0 border-b border-gray-300 text-[16px] outline-none ime-fallback"
      placeholder="카테고리 입력"
      value={categoryInput}
      disabled={disabled}
      onChange={(e) => setCategoryInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" || e.nativeEvent.isComposing || disabled) return;
        e.preventDefault();
        onEnter?.();
      }}
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
    <div className="w-full flex flex-col items-end">
      <div className="w-full flex justify-between items-center">
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
            className="w-4.5 h-4.5 rounded-4xl"
            style={{ backgroundColor: value.value }}
          />
          {!disabled && (isOpen ? <RxTriangleUp /> : <RxTriangleDown />)}
        </div>
      </div>

      <div
        className={`
          mt-4 py-2 flex gap-3 flex-wrap justify-end
          transition-all duration-200 overflow-hidden mr-6 max-sm:w-[60%] px-1
          ${isOpen && !disabled ? "opacity-100" : "opacity-0"}
          ${isOpen && !disabled ? "pointer-events-auto" : "pointer-events-none"}
        `}
        style={{ minHeight: 30 }}
      >
        {COLORS.map((color) => (
          <button
            key={color.name}
            className={`
              w-4.5 h-4.5 rounded-full transition-transform
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
  /** 변경 사항이 없거나 제출 진행 중이면 저장/완료 버튼을 비활성화한다. */
  submitDisabled?: boolean;
}
const ButtonSection = ({
  mode,
  categoryStatus,
  onClose,
  onEdit,
  onSubmit,
  onEnd,
  onRestore,
  submitDisabled = false,
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
        <NormalBlackButton
          text="저장"
          onClick={onSubmit}
          disabled={submitDisabled}
        />
      </div>
    );
  }

  // CREATE
  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton text="닫기" onClick={onClose} />
      <NormalBlackButton
        text="완료"
        onClick={onSubmit}
        disabled={submitDisabled}
      />
    </div>
  );
};

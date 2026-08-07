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

const CATEGORY_NAME_MAX_LENGTH = 20;

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

  const [categoryInput, setCategoryInput] = useState(category?.name ?? "");
  const [selectedColor, setSelectedColor] = useState(
    category
      ? (COLORS.find((c) => c.value === category.color) ?? COLORS[0])
      : COLORS[0],
  );
  const [currentMode, setCurrentMode] = useState(mode);
  // 저장/종료/복구 처리 중 중복 실행 방지 (이중 클릭 시 문서 중복 생성 차단)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = currentMode === "VIEW";

  /** 제출 핸들러 공통 래퍼: 중복 실행 차단 + 실패 시 사용자 알림 */
  const runSubmit = async (action: () => Promise<void>, failMessage: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await action();
      onClose();
    } catch {
      toast.error(failMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = categoryInput.trim();
    if (!name) {
      toast.error("카테고리 이름을 입력해 주세요.");
      return;
    }
    const userId = user?.uid;
    if (!userId) return;

    await runSubmit(async () => {
      await createCategory({ userId, name, color: selectedColor.value });
      await invalidateCategoryQueries(queryClient, userId);
    }, "카테고리 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  };

  const handleUpdateCategory = async () => {
    const name = categoryInput.trim();
    if (!name) {
      toast.error("카테고리 이름을 입력해 주세요.");
      return;
    }
    const userId = user?.uid;
    if (!category || !userId) return;

    await runSubmit(async () => {
      await updateCategory({
        userId,
        categoryId: category.id,
        name,
        color: selectedColor.value,
      });
      await invalidateCategoryQueries(queryClient, userId);
    }, "카테고리 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  };

  const handleEndCategory = async () => {
    if (!category || !user) return;

    await runSubmit(async () => {
      await endCategory({ userId: user.uid, categoryId: category.id });
      await invalidateCategoryQueries(queryClient, user.uid);
    }, "카테고리 종료에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  };

  const handleRestoreCategory = async () => {
    if (!category || !user) return;

    await runSubmit(async () => {
      await restoreCategory({ userId: user.uid, categoryId: category.id });
      await invalidateCategoryQueries(queryClient, user.uid);
    }, "카테고리 복구에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  };

  return (
    <ModalWrapper onClose={isSubmitting ? () => {} : onClose}>
      <ModalTitle mode={currentMode} />
      <Space10 direction="mb" />

      <Input
        categoryInput={categoryInput}
        setCategoryInput={setCategoryInput}
        onEnter={() => {
          if (currentMode === "CREATE") {
            void handleCreateCategory();
            return;
          }
          if (currentMode === "EDIT") {
            void handleUpdateCategory();
          }
        }}
        disabled={isReadOnly || isSubmitting}
      />
      <Space8 direction="mb" />

      <ColorSelector
        value={selectedColor}
        onChange={setSelectedColor}
        disabled={isReadOnly || isSubmitting}
      />
      <Space10 direction="mb" />

      <ButtonSection
        mode={currentMode}
        categoryStatus={category?.status}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onEdit={() => setCurrentMode("EDIT")}
        onSubmit={() => {
          if (currentMode === "CREATE") {
            void handleCreateCategory();
            return;
          }
          void handleUpdateCategory();
        }}
        onEnd={() => void handleEndCategory()}
        onRestore={() => void handleRestoreCategory()}
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
      maxLength={CATEGORY_NAME_MAX_LENGTH}
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
  isSubmitting?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onEnd?: () => void;
  onRestore?: () => void;
}
const ButtonSection = ({
  mode,
  categoryStatus,
  isSubmitting = false,
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
          <NormalBlackUnFillButton
            text="닫기"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <NormalBlackButton
            text={isSubmitting ? "처리 중..." : "복구"}
            onClick={onRestore}
            disabled={isSubmitting}
          />
        </div>
      );
    }

    // ✅ 진행중 카테고리
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton
          text="닫기"
          onClick={onClose}
          disabled={isSubmitting}
        />
        <NormalRedUnFillButton
          text="종료"
          onClick={onEnd}
          disabled={isSubmitting}
        />
        <NormalBlackButton
          text="수정"
          onClick={onEdit}
          disabled={isSubmitting}
        />
      </div>
    );
  }

  // EDIT
  if (mode === "EDIT") {
    return (
      <div className="flex justify-between">
        <NormalBlackUnFillButton
          text="취소"
          onClick={onClose}
          disabled={isSubmitting}
        />
        <NormalBlackButton
          text={isSubmitting ? "저장 중..." : "저장"}
          onClick={onSubmit}
          disabled={isSubmitting}
        />
      </div>
    );
  }

  // CREATE
  return (
    <div className="flex justify-between">
      <NormalBlackUnFillButton
        text="닫기"
        onClick={onClose}
        disabled={isSubmitting}
      />
      <NormalBlackButton
        text={isSubmitting ? "저장 중..." : "완료"}
        onClick={onSubmit}
        disabled={isSubmitting}
      />
    </div>
  );
};

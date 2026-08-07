import { useState } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import { Space10, Space2 } from "@/shared/ui/Space";
import { ModalWrapper } from "@/shared/ui/Modal";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";
import {
  NormalBlackButton,
  NormalBlackUnFillButton,
  NormalRedUnFillButton,
} from "@/shared/ui/Button";
import { db } from "@/firebase/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore/lite";
import { toast } from "react-toastify";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type { AdminNotice } from "../hooks/useAdminNotices";

const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 2000;

interface Props {
  mode: "CREATE" | "VIEW" | "EDIT";
  notice?: AdminNotice;
  onClose: () => void;
  onSaved?: () => Promise<void>;
}

export default function NoticeModal({ mode, notice, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(notice?.title ?? "");
  const [content, setContent] = useState(notice?.content ?? "");
  const [pinned, setPinned] = useState(notice?.pinned ?? false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isReadOnly = currentMode === "VIEW";

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("제목을 입력해 주세요.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (currentMode === "CREATE") {
        await addDoc(collection(db, "notices"), {
          title: trimmedTitle,
          content: content.trim(),
          pinned,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      if (currentMode === "EDIT" && notice) {
        await updateDoc(doc(db, "notices", notice.id), {
          title: trimmedTitle,
          content: content.trim(),
          pinned,
          updatedAt: serverTimestamp(),
        });
      }

      await onSaved?.();
      onClose();
    } catch {
      toast.error("공지 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!notice || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "notices", notice.id));
      await onSaved?.();
      onClose();
    } catch {
      toast.error("공지 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <Text5
        text={
          currentMode === "CREATE"
            ? "공지 추가"
            : currentMode === "EDIT"
            ? "공지 수정"
            : "공지 상세"
        }
        className="font-bold"
      />
      <Space10 direction="mb" />

      <Text3 text="제목" className="font-bold" />
      <Space2 direction="mb" />
      <input
        value={title}
        disabled={isReadOnly || isSubmitting}
        maxLength={TITLE_MAX_LENGTH}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-b outline-none text-sm"
      />

      <Space10 direction="mb" />

      <Text3 text="내용" className="font-bold" />
      <Space2 direction="mb" />
      <textarea
        value={content}
        disabled={isReadOnly || isSubmitting}
        maxLength={CONTENT_MAX_LENGTH}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-32 resize-none border rounded p-2 text-sm outline-none"
      />

      <Space10 direction="mb" />

      {!isReadOnly && (
        <button
          type="button"
          onClick={() => setPinned(!pinned)}
          className="flex items-center gap-2 text-sm"
        >
          {pinned ? (
            <IoIosCheckbox size={18} />
          ) : (
            <IoIosCheckboxOutline size={18} />
          )}
          상단 고정
        </button>
      )}

      <Space10 direction="mb" />

      {/* 버튼 */}
      {currentMode === "VIEW" ? (
        <div className="flex justify-between">
          <NormalBlackUnFillButton
            text="닫기"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <NormalRedUnFillButton
            text="삭제"
            onClick={() => setDeleteOpen(true)}
            disabled={isSubmitting}
          />
          <NormalBlackButton
            text="수정"
            onClick={() => setCurrentMode("EDIT")}
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <div className="flex justify-between">
          <NormalBlackUnFillButton
            text="취소"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <NormalBlackButton
            text={isSubmitting ? "저장 중..." : "저장"}
            onClick={() => void handleSave()}
            disabled={isSubmitting}
          />
        </div>
      )}

      {deleteOpen && (
        <ConfirmModal
          title="공지를 삭제하시겠습니까?"
          description="삭제한 공지는 되돌릴 수 없습니다."
          confirmText="삭제"
          danger
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </ModalWrapper>
  );
}

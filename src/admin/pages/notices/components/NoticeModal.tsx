import { useState } from "react";
import { Text3 } from "@/shared/ui/Text";
import { Space10, Space2 } from "@/shared/ui/Space";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { getModalModeTitle } from "@/shared/utils/getModalModeTitle";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
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

  /**
   * 상세 화면에서 상단 고정을 바로 전환한다.
   *
   * 고정은 되돌리기 쉬운 설정이라 수정 모드를 거치지 않고 즉시 저장한다.
   * 화면을 먼저 바꾸고 실패하면 되돌려, 저장 결과와 표시가 어긋나지 않게 한다.
   */
  const handleTogglePinned = async () => {
    if (!notice || isSubmitting) return;

    const nextPinned = !pinned;
    setPinned(nextPinned);
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "notices", notice.id), {
        pinned: nextPinned,
        updatedAt: serverTimestamp(),
      });
      await onSaved?.();
    } catch {
      setPinned(!nextPinned);
      toast.error("고정 설정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
      <ModalTitle text={getModalModeTitle(currentMode, "공지")} />

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

      {/*
        상세(VIEW)에서는 누르는 즉시 저장하고, 작성·수정 중에는 저장 버튼을 누를 때
        함께 반영한다. 고정 여부를 바꾸려고 수정 모드까지 들어가지 않아도 된다.
      */}
      <div className="flex items-center gap-2 text-sm">
        {/*
          체크박스만 눌리도록 버튼 범위를 아이콘으로 한정한다.
          아이콘이 작아 누르기 어려워지지 않도록 padding 으로 터치 영역을 넓히고,
          음수 margin 으로 보이는 위치는 그대로 유지한다.
          레이블이 버튼 밖으로 나갔으므로 aria-label 로 무엇을 켜는 버튼인지 알린다.
        */}
        <button
          type="button"
          onClick={
            isReadOnly
              ? () => void handleTogglePinned()
              : () => setPinned(!pinned)
          }
          disabled={isSubmitting || (isReadOnly && !notice)}
          aria-pressed={pinned}
          aria-label="상단 고정"
          className="-m-2 p-2 pressable disabled:opacity-40"
        >
          {pinned ? (
            <MdCheckBox size={18} />
          ) : (
            <MdCheckBoxOutlineBlank size={18} />
          )}
        </button>
        <span>상단 고정</span>
      </div>

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

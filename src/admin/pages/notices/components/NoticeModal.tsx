import { useState } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import { Space10, Space2 } from "@/shared/ui/Space";
import { ModalWrapper } from "@/shared/ui/Modal";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";
import { toast } from "react-toastify";
import { useSubmitLock } from "@/shared/hooks/useSubmitLock";
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
import type { AdminNotice } from "../hooks/useAdminNotices";

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

  const isReadOnly = currentMode === "VIEW";
  const { isSubmitting, runExclusive } = useSubmitLock();

  // 변경 감지와 저장에 같은 값을 써야 제출 방식에 따라 결과가 달라지지 않는다.
  const trimmedTitle = title.trim();

  // 변경 사항이 없으면 저장 버튼을 비활성화하기 위한 판단값
  const isDirty = notice
    ? trimmedTitle !== notice.title ||
      content !== notice.content ||
      pinned !== notice.pinned
    : true;

  const handleSave = async () => {
    if (!trimmedTitle) {
      toast.error("제목을 입력해주세요.", {
        toastId: "notice-form-validation",
      });
      return;
    }
    if (!isDirty) return;

    // 저장 후 목록 갱신에서 실패하면 재저장을 유도하지 않도록 구분한다.
    let persisted = false;

    await runExclusive(async () => {
      try {
        if (currentMode === "CREATE") {
          await addDoc(collection(db, "notices"), {
            title: trimmedTitle,
            content,
            pinned,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        if (currentMode === "EDIT" && notice) {
          await updateDoc(doc(db, "notices", notice.id), {
            title: trimmedTitle,
            content,
            pinned,
            updatedAt: serverTimestamp(),
          });
        }

        persisted = true;

        await onSaved?.();
        onClose();
      } catch (e) {
        console.error("공지 저장 실패", e);

        if (persisted) {
          // 저장은 끝났으므로 모달을 닫아 중복 저장을 유발하지 않는다.
          onClose();
          toast.warning(
            "저장은 완료됐지만 목록 갱신에 실패했습니다. 새로고침해주세요.",
          );
          return;
        }

        toast.error("공지 저장에 실패했습니다.");
      }
    });
  };

  const handleDelete = async () => {
    if (!notice) return;
    await deleteDoc(doc(db, "notices", notice.id));
    await onSaved?.();
    onClose();
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
        disabled={isReadOnly}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-b outline-none text-sm"
      />

      <Space10 direction="mb" />

      <Text3 text="내용" className="font-bold" />
      <Space2 direction="mb" />
      <textarea
        value={content}
        disabled={isReadOnly}
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
          <NormalBlackUnFillButton text="닫기" onClick={onClose} />
          <NormalRedUnFillButton text="삭제" onClick={handleDelete} />
          <NormalBlackButton
            text="수정"
            onClick={() => setCurrentMode("EDIT")}
          />
        </div>
      ) : (
        <div className="flex justify-between">
          <NormalBlackUnFillButton text="취소" onClick={onClose} />
          <NormalBlackButton
            text="저장"
            onClick={handleSave}
            disabled={isSubmitting || !isDirty}
          />
        </div>
      )}
    </ModalWrapper>
  );
}

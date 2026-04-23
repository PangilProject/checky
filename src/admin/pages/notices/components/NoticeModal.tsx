import { useState } from "react";
import { Text3, Text5 } from "@/shared/ui/Text";
import { Space10, Space2 } from "@/shared/ui/Space";
import { ModalWrapper } from "@/shared/ui/Modal";
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

  const handleSave = async () => {
    if (!title.trim()) return;

    if (currentMode === "CREATE") {
      await addDoc(collection(db, "notices"), {
        title,
        content,
        pinned,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    if (currentMode === "EDIT" && notice) {
      await updateDoc(doc(db, "notices", notice.id), {
        title,
        content,
        pinned,
        updatedAt: serverTimestamp(),
      });
    }

    await onSaved?.();
    onClose();
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
        className="w-full h-32 border rounded p-2 text-sm"
      />

      <Space10 direction="mb" />

      {!isReadOnly && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          상단 고정
        </label>
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
          <NormalBlackButton text="저장" onClick={handleSave} />
        </div>
      )}
    </ModalWrapper>
  );
}

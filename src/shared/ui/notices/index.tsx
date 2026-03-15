import { useState } from "react";
import { ModalWrapper } from "@/shared/ui/Modal";
import { Text5 } from "@/shared/ui/Text";
import { Space10 } from "@/shared/ui/Space";
import { NormalBlackUnFillButton } from "@/shared/ui/Button";
import { useNotices, type Notice } from "./hooks/useNotices";
import NoticeList from "./components/NoticeList";
import NoticeDetail from "./components/NoticeDetail";

interface Props {
  onClose: () => void;
}

export default function NoticeModal({ onClose }: Props) {
  const { notices, loading } = useNotices();
  const [selected, setSelected] = useState<Notice | null>(null);

  return (
    <ModalWrapper onClose={onClose}>
      <Text5 text={selected ? "공지사항" : "공지 목록"} className="font-bold" />
      <Space10 direction="mb" />

      {loading && <div>로딩 중...</div>}

      {!loading && !selected && (
        <NoticeList notices={notices} onSelect={setSelected} />
      )}

      {!loading && selected && (
        <NoticeDetail notice={selected} onBack={() => setSelected(null)} />
      )}

      <Space10 direction="mb" />

      <div className="flex justify-end">
        <NormalBlackUnFillButton text="닫기" onClick={onClose} />
      </div>
    </ModalWrapper>
  );
}

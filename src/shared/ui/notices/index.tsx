import { useEffect, useRef, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { ModalWrapper } from "@/shared/ui/Modal";
import { Text5 } from "@/shared/ui/Text";
import { Space10 } from "@/shared/ui/Space";
import { NormalBlackUnFillButton } from "@/shared/ui/Button";
import { useNotices } from "./hooks/useNotices";
import NoticeList from "./components/NoticeList";
import NoticeDetail from "./components/NoticeDetail";
import { NoticeListSkeleton } from "./components/NoticeListSkeleton";
import { NoticeNavButton } from "./components/NoticeNavButton";

interface Props {
  onClose: () => void;
}

export default function NoticeModal({ onClose }: Props) {
  const { notices, loading, isError } = useNotices();
  // 공지 객체가 아닌 id를 보관해, 목록이 갱신되어도 위치를 다시 계산할 수 있게 한다
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const selectedIndex = selectedId
    ? notices.findIndex((notice) => notice.id === selectedId)
    : -1;
  // 열어둔 공지가 삭제된 경우 자연스럽게 목록으로 돌아간다
  const selected = selectedIndex >= 0 ? notices[selectedIndex] : null;
  const prevNotice = selectedIndex > 0 ? notices[selectedIndex - 1] : null;
  const nextNotice =
    selectedIndex >= 0 && selectedIndex < notices.length - 1
      ? notices[selectedIndex + 1]
      : null;

  // 다른 공지로 이동하면 본문을 처음부터 읽도록 스크롤을 올린다
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  return (
    <ModalWrapper onClose={onClose}>
      {/*
        전체 높이를 고정하고 본문이 남는 공간을 채우는 구조.
        이전/다음 이동 영역이 생겨도 모달 크기는 그대로 유지되고
        본문 스크롤 영역만 그만큼 줄어들어 레이아웃이 흔들리지 않는다.
      */}
      <div className="flex h-105 max-h-[75vh] flex-col">
        {/* 뒤로가기는 스크롤 영역 밖에 두어 본문이 길어도 항상 보이게 한다 */}
        <div className="flex shrink-0 items-center gap-1">
          {selected && (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="공지 목록으로 돌아가기"
              className="-ml-1 shrink-0 rounded p-1 pressable hover:bg-gray-100"
            >
              <IoChevronBack size={20} />
            </button>
          )}
          <Text5
            text={selected ? "공지사항" : "공지 목록"}
            className="font-bold"
          />
        </div>
        <Space10 direction="mb" />

        {/* 남는 공간을 모두 차지하고 내부에서만 스크롤한다 */}
        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {loading && <NoticeListSkeleton />}

          {!loading && isError && (
            <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
              공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </div>
          )}

          {!loading && !isError && !selected && (
            <NoticeList
              notices={notices}
              onSelect={(notice) => setSelectedId(notice.id)}
            />
          )}

          {!loading && !isError && selected && (
            <NoticeDetail notice={selected} />
          )}
        </div>

        <Space10 direction="mb" />

        {/*
          이전/다음 이동은 본문 밖에 두어 스크롤하지 않아도 보이게 한다.
          왼쪽에 위아래로 쌓고 닫기 버튼은 오른쪽에 고정한다.
        */}
        <div className="flex shrink-0 items-end gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {prevNotice && selected && (
              <NoticeNavButton
                direction="prev"
                notice={prevNotice}
                onSelect={(notice) => setSelectedId(notice.id)}
              />
            )}
            {nextNotice && selected && (
              <NoticeNavButton
                direction="next"
                notice={nextNotice}
                onSelect={(notice) => setSelectedId(notice.id)}
              />
            )}
          </div>

          <NormalBlackUnFillButton
            text="닫기"
            onClick={onClose}
            className="shrink-0"
          />
        </div>
      </div>
    </ModalWrapper>
  );
}

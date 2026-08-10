import { useEffect, useRef, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { ModalWrapper } from "@/shared/ui/Modal";
import { ModalTitle } from "@/shared/ui/ModalTitle";
import { Button } from "@/shared/ui/primitives";
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

  /**
   * 아래에 읽을 내용이 더 남아 있는지 여부.
   *
   * 고정 높이 안에서만 스크롤되고 스크롤바가 거의 보이지 않아,
   * 내용이 더 있다는 사실을 알아채기 어렵다. 하단 페이드로 스크롤을 유도한다.
   */
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  const updateHasMoreBelow = () => {
    const el = contentRef.current;
    if (!el) return;
    // 소수점 스크롤 위치 때문에 끝에 닿아도 1px 미만이 남는 경우가 있다
    setHasMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
  };

  // 다른 공지로 이동하면 본문을 처음부터 읽도록 스크롤을 올린다
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  // 내용이나 영역 크기가 바뀌면 다시 계산한다.
  // ResizeObserver 콜백에서 상태를 바꾸므로 effect 본문에서 직접 setState 하지 않는다.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateHasMoreBelow);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => observer.disconnect();
  }, [selectedId, loading, isError, notices.length]);

  return (
    <ModalWrapper onClose={onClose}>
      {/*
        전체 높이를 고정하고 본문이 남는 공간을 채우는 구조.
        이전/다음 이동 영역이 생겨도 모달 크기는 그대로 유지되고
        본문 스크롤 영역만 그만큼 줄어들어 레이아웃이 흔들리지 않는다.
      */}
      <div className="flex h-105 max-h-[75vh] flex-col">
        {/* 뒤로가기는 스크롤 영역 밖에 두어 본문이 길어도 항상 보이게 한다 */}
        <ModalTitle
          text={selected ? "공지사항" : "공지 목록"}
          leading={
            selected && (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="공지 목록으로 돌아가기"
                className="-ml-1 shrink-0 rounded p-1 pressable hover:bg-surface-sunken"
              >
                <IoChevronBack size={20} />
              </button>
            )
          }
        />

        {/* 남는 공간을 모두 차지하고 내부에서만 스크롤한다 */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={contentRef}
            onScroll={updateHasMoreBelow}
            className="h-full overflow-y-auto overscroll-contain"
          >
            {/* 크기 변화를 관찰할 대상. min-h-full 로 두어 안내 문구 중앙 정렬도 유지한다 */}
            <div className="min-h-full">
              {loading && <NoticeListSkeleton />}

              {!loading && isError && (
                <div className="flex h-full items-center justify-center text-center text-sm text-content-muted">
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
          </div>

          {/*
            아래에 내용이 더 있을 때만 보이는 페이드.
            글이 잘린 것처럼 보이게 해 스크롤할 여지가 있다는 것을 알린다.
            끝까지 내리면 사라지므로 다 읽었다는 신호도 된다.
          */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-surface-raised to-transparent transition-opacity duration-200 ${
              hasMoreBelow ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/*
          이전/다음 이동은 본문 밖에 두어 스크롤하지 않아도 보이게 한다.
          왼쪽에 위아래로 쌓고 닫기 버튼은 오른쪽에 고정한다.
        */}
        <div className="mt-10 flex shrink-0 items-end gap-3">
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

          <Button variant="outline" onClick={onClose} className="shrink-0">
            닫기
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

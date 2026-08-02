import { useLayoutEffect, type RefObject } from "react";

/** 팝오버와 트리거 사이 간격 */
const GAP = 8;
/** 팝오버가 화면 가장자리에 붙지 않도록 두는 여백 */
const VIEWPORT_MARGIN = 8;

/**
 * 트리거 기준으로 팝오버를 뷰포트 좌표(fixed)에 배치합니다.
 *
 * 아래 공간이 부족하면 트리거 위로 뒤집고, 좌우로 넘칠 경우 화면 안으로 밀어 넣습니다.
 * 리렌더를 유발하지 않도록 계산 결과는 DOM style에 직접 반영합니다.
 */
export const usePopoverPosition = (
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  align: "left" | "right" = "left",
) => {
  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const rect = trigger.getBoundingClientRect();
      const { offsetWidth: width, offsetHeight: height } = panel;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 아래 공간이 모자라고 위쪽이 더 넓으면 트리거 위로 띄운다.
      const spaceBelow = viewportHeight - rect.bottom - GAP;
      const spaceAbove = rect.top - GAP;
      const flip = spaceBelow < height && spaceAbove > spaceBelow;

      const rawTop = flip ? rect.top - GAP - height : rect.bottom + GAP;
      const top = Math.min(
        Math.max(rawTop, VIEWPORT_MARGIN),
        Math.max(viewportHeight - height - VIEWPORT_MARGIN, VIEWPORT_MARGIN),
      );

      const rawLeft = align === "right" ? rect.right - width : rect.left;
      const left = Math.min(
        Math.max(rawLeft, VIEWPORT_MARGIN),
        Math.max(viewportWidth - width - VIEWPORT_MARGIN, VIEWPORT_MARGIN),
      );

      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    };

    place();

    window.addEventListener("resize", place);
    // 캡처 단계로 등록해 내부 스크롤 컨테이너 이동도 함께 따라간다.
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align, triggerRef, panelRef]);
};

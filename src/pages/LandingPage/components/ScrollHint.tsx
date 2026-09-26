import { LuChevronDown } from "react-icons/lu";

/**
 * 첫 화면의 스크롤 안내.
 *
 * 첫 장면은 질문과 빈 체크 하나뿐이라 아래로 내려야 이야기가 흐른다는 것을 알기 어렵다.
 * 스크롤을 시작하면 엔진이 옅게 지우고(utils/filmEffects.ts), 위로 되감으면 다시 나타난다.
 * 좁은 화면의 진행 점과 겹치지 않도록 그보다 위에 둔다.
 */
export const ScrollHint = () => (
  <div
    data-scroll-hint=""
    className="pointer-events-none absolute inset-x-0 bottom-14 flex flex-col items-center gap-1 text-content-muted md:bottom-10"
  >
    <span className="text-sm md:text-base">아래로 스크롤해 보세요</span>
    <LuChevronDown size={22} aria-hidden="true" className="animate-bounce" />
  </div>
);

import type { Ref } from "react";
import { SCENES } from "../constants/scenes";

/**
 * 지금 이야기의 어디쯤인지 보여 주는 점.
 * 넓은 화면에서는 오른쪽에 세로로, 좁은 화면에서는 아래에 가로로 둔다.
 * 지금 장면은 엔진이 data-active 로 표시하고, 점을 누르면 그 장면으로 건너뛴다.
 */
export const ProgressIndicator = ({
  ref,
  onSelect,
}: {
  ref: Ref<HTMLElement>;
  onSelect: (index: number) => void;
}) => (
  <nav
    ref={ref}
    aria-label="이야기 진행"
    className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1 md:top-1/2 md:right-5 md:bottom-auto md:left-auto md:translate-x-0 md:-translate-y-1/2 md:flex-col"
  >
    {SCENES.map((scene, index) => (
      <button
        key={scene.id}
        type="button"
        data-scene={scene.id}
        data-active={index === 0}
        aria-label={`${index + 1}. ${scene.label}`}
        onClick={() => onSelect(index)}
        className="group flex h-6 w-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-content-muted opacity-50 transition-all duration-300 group-data-[active=true]:w-4 group-data-[active=true]:bg-content group-data-[active=true]:opacity-100 md:group-data-[active=true]:h-4 md:group-data-[active=true]:w-1.5" />
      </button>
    ))}
  </nav>
);

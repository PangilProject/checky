import { useMemo, useRef } from "react";
import { HERO_ITEM_ID, type CellChecked } from "../constants/demoData";
import { SCENES, TIMELINE_LENGTH, at } from "../constants/scenes";
import { useFilmEngine } from "../hooks/useFilmEngine";
import { FilmActors, FilmHud } from "./FilmActors";
import { ProgressIndicator } from "./ProgressIndicator";
import { PileFrame } from "./Frames/PileFrame";
import { FocusFrame } from "./Frames/FocusFrame";
import { RevealFrame } from "./Frames/RevealFrame";
import { ListFrame } from "./Frames/ListFrame";
import { SplitFrame } from "./Frames/SplitFrame";
import { CalendarFrame } from "./Frames/CalendarFrame";
import { StatsFrame } from "./Frames/StatsFrame";
import { EndingFrame, FinaleFrame } from "./Frames/EndingFrames";

/** 측정용 표에는 체크 상태가 필요 없다. 칸의 자리만 잰다 */
const NO_CHECKS: CellChecked = () => false;

/** 직접 체크했을 때 선이 그려지는 시간. 스크롤로 그릴 때는 스크롤을 따라가야 하므로 이때만 켠다 */
const USER_DRAW_MS = 360;

/**
 * 스크롤로 재생하는 필름.
 *
 * 긴 상자 안에 화면 높이의 무대를 고정해 두고, 스크롤한 거리를 이야기의 시점으로 쓴다.
 * 무대에는 세 층이 겹친다.
 *   measure: 장면마다 멈춘 모습(프레임). 보이지 않으며, 배우가 갈 자리를 재는 데만 쓴다
 *   world:   배우. 카메라가 이 층을 당기고 민다
 *   hud:     문장과 버튼. 카메라와 무관하게 제자리에 있다
 */
export const Film = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLElement>(null);
  const userChecked = useRef(false);

  const refs = useMemo(
    () => ({ scroller, stage, backdrop, measure, world, progress, userChecked }),
    [],
  );
  const engine = useFilmEngine(refs);

  const handleHeroCheck = () => {
    if (userChecked.current) return;
    userChecked.current = true;

    const root = scroller.current;
    const line = root?.querySelector<SVGElement>('[data-actor="check"] [data-check-line]');
    const pop = root?.querySelector<HTMLElement>(`[data-actor="icon:${HERO_ITEM_ID}"] [data-pop]`);
    if (line) {
      line.style.transition = `stroke-dashoffset ${USER_DRAW_MS}ms cubic-bezier(0.3, 0.7, 0.3, 1)`;
      window.setTimeout(() => (line.style.transition = ""), USER_DRAW_MS + 40);
    }
    if (pop) {
      pop.classList.remove("animate-checky-check-pop");
      void pop.offsetWidth;
      pop.classList.add("animate-checky-check-pop");
    }
    engine.current.render();
  };

  return (
    <div
      ref={scroller}
      className="relative"
      style={{ height: `calc(${TIMELINE_LENGTH / 100 + 1} * 100svh)` }}
    >
      <div ref={backdrop} className="sticky top-0 h-lvh overflow-hidden text-content">
        <div ref={stage} className="absolute inset-x-0 top-0 h-svh">
          <div ref={measure} className="invisible absolute inset-0" aria-hidden="true">
            <PileFrame mode="film" />
            <FocusFrame mode="film" />
            <RevealFrame mode="film" />
            <ListFrame mode="film" />
            <SplitFrame mode="film" isChecked={NO_CHECKS} />
            <CalendarFrame mode="film" filledUntil={0} />
            <StatsFrame mode="film" />
            <FinaleFrame mode="film" />
            <EndingFrame mode="film" />
          </div>
          <div ref={world} className="absolute inset-0 origin-top-left">
            <FilmActors />
          </div>
          <div className="absolute inset-0">
            <FilmHud onHeroCheck={handleHeroCheck} />
          </div>
        </div>
        <ProgressIndicator
          ref={progress}
          onSelect={(index) => engine.current.seek(at(SCENES[index].id, index === 0 ? 0 : 0.02))}
        />
      </div>
    </div>
  );
};

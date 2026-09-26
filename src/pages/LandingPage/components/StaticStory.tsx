import { useState } from "react";
import {
  DEMO_CATEGORIES,
  DEMO_TODAY,
  HERO_ITEM_ID,
  itemById,
  type CellChecked,
} from "../constants/demoData";
import { CheckIcon } from "./AppMock/CheckIcon";
import { TaskRowTitle } from "./AppMock/TaskRowTitle";
import { PileFrame } from "./Frames/PileFrame";
import { FocusFrame } from "./Frames/FocusFrame";
import { RevealFrame } from "./Frames/RevealFrame";
import { ListFrame } from "./Frames/ListFrame";
import { SplitFrame } from "./Frames/SplitFrame";
import { CalendarFrame } from "./Frames/CalendarFrame";
import { StatsFrame } from "./Frames/StatsFrame";
import { EndingFrame, FinaleFrame } from "./Frames/EndingFrames";
import { LandingCta } from "./LandingCta";

/** 표가 막 생긴 때. 사용자가 체크한 일요일의 물 한 잔만 채워져 있다 */
const ONLY_HERO: CellChecked = (routine, weekday) =>
  routine.id === HERO_ITEM_ID && weekday === 0;

/**
 * 움직임 줄이기를 켠 방문자에게 보여 주는 랜딩.
 *
 * 필름의 각 장면이 멈춰 선 모습을 세로로 이어 둔다. 같은 프레임 컴포넌트를 쓰므로
 * 필름과 내용이 어긋나지 않는다. 직접 체크해 보는 칸만은 여기서도 실제로 눌린다.
 */
export const StaticStory = () => {
  const [heroChecked, setHeroChecked] = useState(false);
  const hero = itemById(HERO_ITEM_ID);

  return (
    <div>
      <PileFrame mode="static" />
      <FocusFrame
        mode="static"
        heroControl={
          <button
            type="button"
            aria-pressed={heroChecked}
            onClick={() => setHeroChecked((checked) => !checked)}
            className="flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <CheckIcon color={DEMO_CATEGORIES.inbox.color} size={40} checked={heroChecked} />
            <TaskRowTitle className="text-2xl font-bold md:text-4xl">{hero.title}</TaskRowTitle>
          </button>
        }
      />
      <RevealFrame mode="static" />
      <ListFrame mode="static" />
      <SplitFrame mode="static" isChecked={ONLY_HERO} />
      <CalendarFrame mode="static" filledUntil={DEMO_TODAY + 6} />
      <StatsFrame mode="static" />
      <FinaleFrame mode="static" />
      <EndingFrame mode="static" cta={<LandingCta />} />
    </div>
  );
};


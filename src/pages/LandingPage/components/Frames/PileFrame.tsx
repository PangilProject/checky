import { DEMO_ITEMS, HERO_ITEM_ID } from "../../constants/demoData";
import { Anchor, CaptionText, FrameLayout, type FrameMode } from "./FrameLayout";
import { ScatteredRow, type ScatterPosition } from "./ScatteredRow";
import { COPY } from "../../constants/copy";

/**
 * 오프닝의 끝. 빈 체크 하나 주위로 정리되지 않은 할 일이 쌓여 있다.
 * 흩어진 자리는 가운데를 에워싸도록 골랐다. 날아다니는 것이 아니라 쌓여서 답답한 느낌이 목표다.
 */
const POSITIONS: Record<string, ScatterPosition> = {
  parcel: { sm: [30, 30], md: [26, 34] },
  workout: { sm: [70, 38], md: [72, 30] },
  homework: { sm: [28, 72], md: [22, 60] },
  medicine: { sm: [74, 66], md: [78, 56] },
  english: { sm: [34, 84], md: [32, 80] },
  hospital: { sm: [68, 90], md: [68, 82] },
  water: { sm: [50, 53], md: [50, 50] },
};

export const PileFrame = ({ mode }: { mode: FrameMode }) => (
  <FrameLayout id="pile" mode={mode}>
    <div className="px-6 pt-[14svh] text-center">
      <Anchor id="cap:question" className="inline-block">
        <CaptionText>{COPY.question}</CaptionText>
      </Anchor>
    </div>
    <div className={mode === "film" ? "relative flex-1" : "relative h-[60svh]"}>
      {DEMO_ITEMS.map((item) => {
        const isHero = item.id === HERO_ITEM_ID;
        return (
          <ScatteredRow
            key={item.id}
            item={item}
            position={POSITIONS[item.id]}
            iconSize={isHero ? 44 : 20}
            pinIcon={isHero}
            titleClassName={isHero ? "text-xl md:text-2xl" : "text-content-muted"}
          />
        );
      })}
    </div>
  </FrameLayout>
);

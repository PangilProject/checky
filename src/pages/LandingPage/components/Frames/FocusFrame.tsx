import type { ReactNode } from "react";
import { DEMO_ITEMS, HERO_ITEM_ID } from "../../constants/demoData";
import { Anchor, Caption, FrameLayout, type FrameMode } from "./FrameLayout";
import { ScatteredRow, type ScatterPosition } from "./ScatteredRow";
import { COPY } from "../../constants/copy";

/** 주인공 하나만 앞으로 나오고, 나머지는 가장자리로 물러난다 */
const POSITIONS: Record<string, ScatterPosition> = {
  parcel: { sm: [24, 22], md: [14, 24] },
  workout: { sm: [76, 26], md: [86, 22] },
  homework: { sm: [20, 76], md: [10, 64] },
  medicine: { sm: [80, 72], md: [90, 60] },
  english: { sm: [26, 92], md: [18, 88] },
  hospital: { sm: [74, 94], md: [82, 90] },
  water: { sm: [50, 48], md: [50, 48] },
};

/**
 * 체크 장면. 정적 화면에서는 heroControl 로 실제 체크 버튼을 넘겨받아 주인공 자리에 둔다.
 * 필름에서는 버튼이 무대 위(HUD)에 따로 있고, 이 프레임은 그 자리(hit)만 알려 준다.
 */
export const FocusFrame = ({
  mode,
  heroChecked = false,
  heroControl,
}: {
  mode: FrameMode;
  heroChecked?: boolean;
  heroControl?: ReactNode;
}) => (
  <FrameLayout
    id="focus"
    mode={mode}
    caption={
      <Caption id="tryCheck" mode={mode}>
        {COPY.tryCheck}
      </Caption>
    }
  >
    <div className="px-6 pt-[10svh] text-center">
      <Anchor id="cap:question" className="inline-block opacity-40">
        <p className="text-base font-bold whitespace-pre-line md:text-lg">
          {COPY.question}
        </p>
      </Anchor>
    </div>
    <div className={mode === "film" ? "relative flex-1" : "relative h-[50svh]"}>
      {DEMO_ITEMS.filter((item) => item.id !== HERO_ITEM_ID).map((item) => (
        <ScatteredRow
          key={item.id}
          item={item}
          position={POSITIONS[item.id]}
          iconSize={16}
          className="opacity-30"
          titleClassName="text-sm"
        />
      ))}
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Anchor id="hit" className="relative px-4 py-3">
          {heroControl ?? (
            <ScatteredRow
              item={DEMO_ITEMS.find((item) => item.id === HERO_ITEM_ID)!}
              position={POSITIONS.water}
              iconSize={40}
              checked={heroChecked}
              className="static translate-x-0 translate-y-0 gap-3"
              titleClassName="text-2xl font-bold md:text-4xl"
            />
          )}
        </Anchor>
      </div>
    </div>
  </FrameLayout>
);


import { DEMO_CATEGORIES, DEMO_ITEMS, DEMO_TODAY, HERO_ITEM_ID, LIST_ORDER, itemById } from "../../constants/demoData";
import { getTaskSubTitle } from "../../utils/storyLabels";
import { CategoryHeader } from "../AppMock/AddCategory";
import { CheckIcon } from "../AppMock/CheckIcon";
import { TaskRowTitle } from "../AppMock/TaskRowTitle";
import { AppHeaderAnchors, Anchor, Caption, FrameLayout, ScreenArea, type FrameMode } from "./FrameLayout";
import { SectionHead } from "./SectionHead";
import { COPY } from "../../constants/copy";

/**
 * Checky 안으로 들어온 장면. 방금 체크한 물 한 잔 마시기가 맨 위에 체크된 채 남아 있다.
 * 아직 할 일과 루틴이 한 목록에 섞여 있다. 다음 장면에서 갈라진다.
 *
 * 넓은 화면에서는 폭을 휴대폰 화면만큼 좁혀 두고, phone 표식으로 기기 테두리 자리를 알려 준다.
 */
export const ListFrame = ({ mode }: { mode: FrameMode }) => (
  <FrameLayout
    id="list"
    mode={mode}
    caption={
      <Caption id="list" mode={mode}>
        {COPY.list}
      </Caption>
    }
  >
    <ScreenArea mode={mode} className="max-w-[24rem]">
      {mode === "film" && (
        <Anchor id="phone" className="absolute -inset-x-5 -top-3 -bottom-8 rounded-[2.75rem]" />
      )}
      <AppHeaderAnchors />
      <SectionHead
        slot="task"
        title="할 일 목록"
        subTitle={getTaskSubTitle(DEMO_TODAY, 1, DEMO_ITEMS.length)}
      />
      <Anchor id="cat" className="mt-2">
        <CategoryHeader
          name={DEMO_CATEGORIES.inbox.name}
          color={DEMO_CATEGORIES.inbox.color}
          count={`1 / ${DEMO_ITEMS.length}`}
        />
      </Anchor>
      {LIST_ORDER.map((id) => (
        <div key={id} className="flex items-start gap-2 py-1">
          <Anchor id={`icon:${id}`} className="mt-0.5">
            <CheckIcon color={DEMO_CATEGORIES.inbox.color} checked={id === HERO_ITEM_ID} />
          </Anchor>
          <Anchor id={`title:${id}`}>
            <TaskRowTitle className={id === HERO_ITEM_ID ? "line-through opacity-60" : undefined}>
              {itemById(id).title}
            </TaskRowTitle>
          </Anchor>
        </div>
      ))}
    </ScreenArea>
  </FrameLayout>
);

import { DEMO_CATEGORIES, LIST_ORDER, itemById } from "../../constants/demoData";
import { CheckyCharacter } from "../CheckyCharacter";
import { Wordmark } from "../AppMock/Logo";
import { TaskRowTitle } from "../AppMock/TaskRowTitle";
import { CheckIcon } from "../AppMock/CheckIcon";
import { Anchor, FrameLayout, type FrameMode } from "./FrameLayout";

/**
 * 브랜드가 처음 드러나는 장면.
 *
 * big: 체크가 캐릭터의 팔로 줄어들기 직전, 화면 한가운데를 차지하는 크기.
 * 아래쪽 목록: 체크가 앞에 나선 동안 나머지 할 일이 비켜 서 있는 자리. 무대 밖이라 보이지 않는다.
 *   사라지는 것이 아니라 카메라 밖으로 밀려났다가 다음 장면에서 목록으로 돌아온다.
 */
export const RevealFrame = ({ mode }: { mode: FrameMode }) => (
  <FrameLayout id="reveal" mode={mode} className="items-center justify-center">
    {mode === "film" && (
      <>
        <Anchor
          id="big"
          className="absolute top-[46%] left-1/2 aspect-square w-[min(72vw,56svh)] -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute top-[118%] left-1/2 flex -translate-x-1/2 flex-col gap-2">
          {LIST_ORDER.map((id) => (
            <div key={id} className="flex items-center gap-2">
              <Anchor id={`icon:${id}`}>
                <CheckIcon color={DEMO_CATEGORIES.inbox.color} />
              </Anchor>
              <Anchor id={`title:${id}`}>
                <TaskRowTitle>{itemById(id).title}</TaskRowTitle>
              </Anchor>
            </div>
          ))}
        </div>
      </>
    )}
    <Anchor id="char" className="w-[min(46vw,15rem,34svh)]">
      <CheckyCharacter armSlot={<Anchor id="arm" className="h-full w-full" />} />
    </Anchor>
    <Anchor id="mark" className="mt-6">
      <Wordmark className="text-5xl md:text-6xl" />
    </Anchor>
  </FrameLayout>
);

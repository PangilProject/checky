import type { ReactNode } from "react";
import { Text } from "@/shared/ui/primitives";
import { CheckyCharacter } from "../CheckyCharacter";
import { Wordmark } from "../AppMock/Logo";
import { Anchor, Caption, CaptionText, FrameLayout, type FrameMode } from "./FrameLayout";
import { COPY } from "../../constants/copy";

/**
 * 막대가 모여 다시 체크가 된 장면. 첫 질문("얼마나 남아있나요?")이 있던 자리에 답이 온다.
 */
export const FinaleFrame = ({ mode }: { mode: FrameMode }) => (
  <FrameLayout
    id="finale"
    mode={mode}
    caption={
      <Caption id="done" mode={mode}>
        {COPY.done}
      </Caption>
    }
  >
    <div className="px-6 pt-[14svh] text-center">
      <Anchor id="cap:zero" className="inline-block">
        <CaptionText>{COPY.zero}</CaptionText>
      </Anchor>
    </div>
    <div className="relative flex-1">
      <Anchor
        id="big"
        className="absolute top-1/2 left-1/2 aspect-square w-[min(56vw,40svh)] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  </FrameLayout>
);

/**
 * 마지막 장면. 체크가 다시 캐릭터의 팔이 되고, 그 아래에서 시작하기 버튼이 열린다.
 * cta 는 정적 화면에서만 넘긴다. 필름에서는 버튼이 무대 위에 따로 있고 여기서는 자리만 잰다.
 */
export const EndingFrame = ({ mode, cta }: { mode: FrameMode; cta?: ReactNode }) => (
  <FrameLayout id="ending" mode={mode} className="items-center justify-center px-6 text-center">
    <Anchor id="cap:zero" className="inline-block">
      <Text variant="bodySm" tone="muted" as="p">
        {COPY.zero}
      </Text>
    </Anchor>
    <Anchor id="cap:done" className="mb-8 inline-block [@media(max-height:520px)]:mb-2">
      <Text variant="bodySm" tone="muted" as="p">
        {COPY.done}
      </Text>
    </Anchor>
    <Anchor id="char" className="w-[min(36vw,11rem,22svh)]">
      <CheckyCharacter armSlot={<Anchor id="arm" className="h-full w-full" />} />
    </Anchor>
    <Anchor id="mark" className="mt-6 [@media(max-height:520px)]:mt-2">
      <Wordmark className="text-4xl md:text-5xl [@media(max-height:520px)]:text-3xl" />
    </Anchor>
    <Anchor id="slogan" className="mt-3">
      <Text variant="body" as="p" className="whitespace-nowrap">
        {COPY.slogan}
      </Text>
    </Anchor>
    <Anchor id="cta" className="mt-8 w-full max-w-xs [@media(max-height:520px)]:mt-3">
      {cta ?? <div className="h-24" />}
    </Anchor>
  </FrameLayout>
);

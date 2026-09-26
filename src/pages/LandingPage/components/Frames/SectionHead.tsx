import { SectionControls, SectionSubTitle, SectionTitle } from "../AppMock/TitleSection";
import { Anchor } from "./FrameLayout";

/**
 * 섹션 머리 (TitleSection). 제목·부제·버튼을 따로 잰다.
 * 장면이 바뀌어도 같은 머리가 글자만 바꿔 다음 섹션의 머리가 되기 때문이다.
 * slot 은 utils/buildTracks.ts 에서 머리를 가리키는 이름이다 (task, main).
 */
export const SectionHead = ({
  slot,
  title,
  subTitle,
  controls = "nav",
}: {
  slot: "task" | "main";
  title: string;
  subTitle: string;
  controls?: "nav" | "mode";
}) => (
  <div className="flex items-start justify-between">
    <div>
      <Anchor id={`${slot}Title`} className="w-fit">
        <SectionTitle>{title}</SectionTitle>
      </Anchor>
      <Anchor id={`${slot}Sub`} className="w-fit">
        <SectionSubTitle>{subTitle}</SectionSubTitle>
      </Anchor>
    </div>
    <Anchor id={`${slot}Ctl`}>
      <SectionControls variant={controls} />
    </Anchor>
  </div>
);

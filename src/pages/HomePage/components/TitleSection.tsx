import type { ReactNode } from "react";
import { Stack, Text } from "@/shared/ui/primitives";
import { TitleText } from "@/shared/ui/TitleText";
import { VscTriangleLeft } from "react-icons/vsc";
import { VscTriangleRight } from "react-icons/vsc";

interface TitleSectionProps {
  title: string;
  subTitle: string;
  leftOnClick?: () => void;
  rightOnClick?: () => void;
  onTodayClick?: () => void;
  onRefreshClick?: () => void;
  /** 버튼 앞에 두는 섹션 전용 컨트롤 (기간 전환 등) */
  extra?: ReactNode;
  /**
   * 제목에 붙일 id. 섹션 전체를 감싼 쪽이 이 id 로 섹션 이름을 건다.
   * 홈의 섹션 넷이 "오늘"·"새로고침"·이전·다음을 같은 이름으로 가지므로, 섹션 이름으로
   * 어느 섹션의 버튼인지 스크린 리더와 테스트가 구분한다
   */
  titleId?: string;
}
function TitleSection({
  title,
  subTitle,
  leftOnClick,
  rightOnClick,
  onTodayClick,
  onRefreshClick,
  extra,
  titleId,
}: TitleSectionProps) {
  return (
    <div>
      {/* 좁은 화면에서 버튼이 많아지면(할 일 목록의 보기 전환 등) 제목을 밀어내지 않고 다음 줄로 내린다 */}
      <div className="flex flex-wrap justify-between items-start gap-y-2">
        <div>
          <TitleText text={title} id={titleId} />
          <SubTitle text={subTitle} />
        </div>

        <Stack gap={3} direction="row" align="center">
          {extra}

          {onRefreshClick && (
            <button
              onClick={onRefreshClick}
              className="px-3 py-1 text-sm rounded-md bg-surface-hover hover:bg-surface-selected pressable"
            >
              새로고침
            </button>
          )}

          {onTodayClick && (
            <button
              onClick={onTodayClick}
              className="px-3 py-1 text-sm rounded-md bg-surface-hover hover:bg-surface-selected pressable"
            >
              오늘
            </button>
          )}

          <button type="button" className="pressable" onClick={leftOnClick} aria-label="이전">
            <VscTriangleLeft size={20} />
          </button>
          <button type="button" className="pressable" onClick={rightOnClick} aria-label="다음">
            <VscTriangleRight size={20} />
          </button>
        </Stack>
      </div>
    </div>
  );
}

interface SubTitleProps {
  text: string;
}
const SubTitle = ({ text }: SubTitleProps) => {
  return <Text variant="bodySm">{text}</Text>;
};
export default TitleSection;

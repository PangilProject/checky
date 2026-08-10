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
}
function TitleSection({
  title,
  subTitle,
  leftOnClick,
  rightOnClick,
  onTodayClick,
  onRefreshClick,
}: TitleSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <TitleText text={title} />
          <SubTitle text={subTitle} />
        </div>

        <Stack gap={3} direction="row" align="center">
          {onRefreshClick && (
            <button
              onClick={onRefreshClick}
              className="px-3 py-1 text-sm rounded-md bg-surface-sunken pressable"
            >
              새로고침
            </button>
          )}

          {onTodayClick && (
            <button
              onClick={onTodayClick}
              className="px-3 py-1 text-sm rounded-md bg-surface-sunken pressable"
            >
              오늘
            </button>
          )}

          <div className="pressable" onClick={leftOnClick}>
            <VscTriangleLeft size={20} />
          </div>
          <div className="pressable" onClick={rightOnClick}>
            <VscTriangleRight size={20} />
          </div>
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

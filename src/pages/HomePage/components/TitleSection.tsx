import { Text2 } from "@/shared/ui/Text";
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

        <div className="flex items-center gap-3">
          {onRefreshClick && (
            <button
              onClick={onRefreshClick}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 pressable"
            >
              새로고침
            </button>
          )}

          {onTodayClick && (
            <button
              onClick={onTodayClick}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 pressable"
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
        </div>
      </div>
    </div>
  );
}

interface SubTitleProps {
  text: string;
}
const SubTitle = ({ text }: SubTitleProps) => {
  return <Text2 text={text} />;
};
export default TitleSection;

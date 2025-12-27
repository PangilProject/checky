import { Text2 } from "@/shared/ui/Text";
import { TitleText } from "@/shared/ui/TitleText";
import { VscTriangleLeft } from "react-icons/vsc";
import { VscTriangleRight } from "react-icons/vsc";

interface TitleSectionProps {
  title: string;
  subTitle: string;
  leftOnClick?: () => void;
  rightOnClick?: () => void;
}
function TitleSection({
  title,
  subTitle,
  leftOnClick,
  rightOnClick,
}: TitleSectionProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <TitleText text={title} />
        <SubTitle text={subTitle} />
      </div>
      <div className="flex gap-3">
        <div className="pressable" onClick={leftOnClick}>
          <VscTriangleLeft size={20} />
        </div>
        <div className="pressable" onClick={rightOnClick}>
          <VscTriangleRight size={20} />
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

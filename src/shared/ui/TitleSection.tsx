import { Text5 } from "./Text";

interface TitleSectionProps {
  text: string;
}

export const TitleSection = ({ text }: TitleSectionProps) => {
  return <Text5 text={text} className="font-bold" />;
};

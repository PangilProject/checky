import { Text5 } from "./Text";

interface TitleTextProps {
  text: string;
}

export const TitleText = ({ text }: TitleTextProps) => {
  return <Text5 text={text} className="font-bold" />;
};

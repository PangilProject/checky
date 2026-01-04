import { Text4 } from "./Text";

interface TitleTextProps {
  text: string;
  className?: string;
}

export const TitleText = ({ text, className }: TitleTextProps) => {
  return <Text4 text={text} className={`font-bold ${className} `} />;
};

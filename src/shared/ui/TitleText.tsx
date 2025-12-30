import { Text5 } from "./Text";

interface TitleTextProps {
  text: string;
  className?: string;
}

export const TitleText = ({ text, className }: TitleTextProps) => {
  return <Text5 text={text} className={`font-bold ${className}`} />;
};
